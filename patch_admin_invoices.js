const fs = require('fs');
let data = fs.readFileSync('public/admin.js', 'utf8');

// 1. renderOwnerBilling
data = data.replace(
    /createInvoice\('\${d\.id}', '\${start}', '\${end}', \${d\.cost}\)/g,
    "createInvoice('${d.id}', '${start}', '${end}', ${d.cost}, ${d.activeEmployees}, ${d.totalHours})"
);

// 2. createInvoice signature & body
data = data.replace(
    /async function createInvoice\(clientId, start, end, amount\) \{/,
    "async function createInvoice(clientId, start, end, amount, workers, hours) {"
);
data = data.replace(
    /body: JSON\.stringify\(\{ clientId, startDate: start, endDate: end, amount \}\)/,
    "body: JSON.stringify({ clientId, startDate: start, endDate: end, amount, workers, hours })"
);

// 3. renderOwnerInvoices print button
data = data.replace(
    /printInvoice\(\${inv\.id}, '\${inv\.client\.name}', '\${start}', '\${end}', \${inv\.amount}\)/g,
    "printInvoice(${inv.id}, '${inv.client.name}', '${start}', '${end}', ${inv.amount}, ${inv.workers || 0}, ${inv.hours || 0})"
);

// 4. printInvoice function
const oldPrintInvoiceRegex = /function printInvoice\(id, clientName, start, end, amount\) \{[\s\S]*?\}\n/s;
const newPrintInvoice = `function printInvoice(id, clientName, start, end, amount, workers, hours) {
    const printWindow = window.open('', '', 'height=800,width=800');
    printWindow.document.write(\`<html><head><title>Invoice #\${id}</title>\`);
    printWindow.document.write(\`<style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; } 
        .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; } 
        .header h1 { margin: 0; color: #1e3a8a; }
        .details-grid { display: flex; justify-content: space-between; margin-bottom: 40px; gap: 20px; }
        .editable-box { border: 1px dashed #cbd5e1; padding: 15px; min-width: 250px; min-height: 100px; border-radius: 8px; background: #f8fafc; }
        .editable-box:focus { outline: 2px solid #3b82f6; background: #fff; }
        .invoice-meta p { margin: 5px 0; font-size: 14px; }
        .summary-text { font-size: 16px; margin: 30px 0; padding: 15px; background: #f1f5f9; border-left: 4px solid #3b82f6; }
        .totals-table { width: 100%; max-width: 400px; margin-left: auto; border-collapse: collapse; margin-top: 30px; }
        .totals-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 16px; }
        .totals-table tr:last-child td { border-bottom: none; font-size: 20px; font-weight: bold; color: #0f172a; }
        .text-right { text-align: right; }
        .vat-input { border: 1px dashed #cbd5e1; width: 40px; text-align: right; padding: 2px; }
        @media print {
            .editable-box { border: 1px solid transparent; background: transparent; padding: 0; min-height: auto; }
            .vat-input { border: none; }
            .no-print { display: none; }
        }
    </style>\`);
    printWindow.document.write('</head><body>');
    printWindow.document.write(\`
        <div class="header">
            <div>
                <h1>Invoice / Счёт</h1>
                <p style="color: #64748b; margin-top: 5px;">#\${id}</p>
            </div>
            <div class="invoice-meta text-right">
                <p><strong>Дата выставления:</strong> \${new Date().toLocaleDateString()}</p>
                <p><strong>Период:</strong> \${start} - \${end}</p>
            </div>
        </div>

        <div class="details-grid">
            <div>
                <strong style="display:block; margin-bottom:10px; color:#475569;">ПОСТАВЩИК:</strong>
                <div contenteditable="true" class="editable-box">
                    [Нажмите, чтобы ввести реквизиты поставщика]
                </div>
            </div>
            <div>
                <strong style="display:block; margin-bottom:10px; color:#475569;">КЛИЕНТ:</strong>
                <div contenteditable="true" class="editable-box">
                    \${clientName}<br>
                    [Нажмите, чтобы дополнить реквизиты клиента]
                </div>
            </div>
        </div>

        <div class="summary-text">
            <strong>За отчётный период:</strong> \${workers} работников, отработано \${Number(hours).toFixed(2)} часов.
        </div>

        <table class="totals-table">
            <tr>
                <td>К оплате (без НДС):</td>
                <td class="text-right" id="subtotal">\${amount.toFixed(2)} ₪</td>
            </tr>
            <tr>
                <td>НДС (<input type="number" id="vat-percent" class="vat-input" value="17" min="0" max="100">%):</td>
                <td class="text-right" id="vat-amount">0.00 ₪</td>
            </tr>
            <tr>
                <td>ИТОГО К ОПЛАТЕ:</td>
                <td class="text-right" id="total-amount">0.00 ₪</td>
            </tr>
        </table>
        
        <div style="margin-top: 50px; text-align: center;" class="no-print">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #3b82f6; color: white; border: none; border-radius: 5px;">Распечатать счёт</button>
        </div>

        <script>
            function calculateTotal() {
                const subtotal = \${amount};
                const vatPercent = parseFloat(document.getElementById('vat-percent').value) || 0;
                const vatAmount = subtotal * (vatPercent / 100);
                const total = subtotal + vatAmount;
                
                document.getElementById('vat-amount').innerText = vatAmount.toFixed(2) + ' ₪';
                document.getElementById('total-amount').innerText = total.toFixed(2) + ' ₪';
            }
            
            document.getElementById('vat-percent').addEventListener('input', calculateTotal);
            calculateTotal(); // initial calculation
        </script>
    \`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
}
`;

data = data.replace(oldPrintInvoiceRegex, newPrintInvoice);

fs.writeFileSync('public/admin.js', data, 'utf8');
console.log('Patched admin.js successfully.');
