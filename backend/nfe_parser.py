from lxml import etree
import logging

logger = logging.getLogger(__name__)


def parse_nfe_xml(xml_content: bytes) -> dict:
    try:
        root = etree.fromstring(xml_content)
        
        # NFe namespaces
        ns = {'nfe': 'http://www.portalfiscal.inf.br/nfe'}
        
        # Try with namespace first, then without
        def find(xpath_ns, xpath_plain):
            result = root.find(xpath_ns, ns)
            if result is None:
                result = root.find(xpath_plain)
            return result
        
        def find_text(xpath_ns, xpath_plain, default=''):
            el = find(xpath_ns, xpath_plain)
            return el.text if el is not None and el.text else default
        
        # Extract invoice number
        invoice_number = find_text('.//nfe:ide/nfe:nNF', './/ide/nNF', '')
        
        # Extract issue date
        issue_date = find_text('.//nfe:ide/nfe:dhEmi', './/ide/dhEmi', '')
        if not issue_date:
            issue_date = find_text('.//nfe:ide/nfe:dEmi', './/ide/dEmi', '')
        if issue_date and 'T' in issue_date:
            issue_date = issue_date.split('T')[0]
        
        # Extract supplier info
        supplier_name = find_text('.//nfe:emit/nfe:xNome', './/emit/xNome', '')
        supplier_cnpj = find_text('.//nfe:emit/nfe:CNPJ', './/emit/CNPJ', '')
        
        # Extract totals
        total_value = float(find_text('.//nfe:ICMSTot/nfe:vNF', './/ICMSTot/vNF', '0'))
        tax_icms = float(find_text('.//nfe:ICMSTot/nfe:vICMS', './/ICMSTot/vICMS', '0'))
        tax_ipi = float(find_text('.//nfe:ICMSTot/nfe:vIPI', './/ICMSTot/vIPI', '0'))
        tax_value = tax_icms + tax_ipi
        
        # Extract items
        items = []
        det_elements = root.findall('.//nfe:det', ns)
        if not det_elements:
            det_elements = root.findall('.//det')
        
        for det in det_elements:
            prod = det.find('nfe:prod', ns)
            if prod is None:
                prod = det.find('prod')
            if prod is None:
                continue
            
            def prod_text(tag, default=''):
                el = prod.find(f'nfe:{tag}', ns)
                if el is None:
                    el = prod.find(tag)
                return el.text if el is not None and el.text else default
            
            item = {
                'product_name': prod_text('xProd'),
                'product_sku': prod_text('cProd'),
                'quantity': float(prod_text('qCom', '0')),
                'unit_price': float(prod_text('vUnCom', '0')),
                'total': float(prod_text('vProd', '0')),
                'tax': 0
            }
            items.append(item)
        
        return {
            'invoice_number': invoice_number,
            'supplier_name': supplier_name,
            'supplier_cnpj': supplier_cnpj,
            'issue_date': issue_date,
            'total_value': total_value,
            'tax_value': tax_value,
            'items': items
        }
    
    except Exception as e:
        logger.error(f"Error parsing NFe XML: {e}")
        raise ValueError(f"Failed to parse XML: {str(e)}")
