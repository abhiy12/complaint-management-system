const reportService = require('../services/report.service');
const { success } = require('../utils/apiResponse');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

async function dashboard(req, res, next) {
  try { return success(res, await reportService.dashboard()); }
  catch (err) { return next(err); }
}

async function vendorReport(req, res, next) {
  try { return success(res, await reportService.vendorReport()); }
  catch (err) { return next(err); }
}

async function executiveReport(req, res, next) {
  try { return success(res, await reportService.executiveReport()); }
  catch (err) { return next(err); }
}

// GET /api/reports/export?type=vendor&format=excel|csv
async function exportReport(req, res, next) {
  try {
    const { type = 'vendor', format = 'excel' } = req.query;
    const data = type === 'executive' ? await reportService.executiveReport() : await reportService.vendorReport();

    if (format === 'csv') {
      const csv = new Parser().parse(data);
      res.header('Content-Type', 'text/csv');
      res.attachment(`${type}-report.csv`);
      return res.send(csv);
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      res.header('Content-Type', 'application/pdf');
      res.attachment(`${type}-report.pdf`);
      doc.pipe(res);

      doc.fontSize(16).text(`${type === 'executive' ? 'Executive Performance' : 'Vendor Wise'} Report`, { align: 'center' });
      doc.moveDown();

      if (data.length) {
        const columns = Object.keys(data[0]);
        const colWidth = (doc.page.width - 80) / columns.length;

        doc.fontSize(10).font('Helvetica-Bold');
        columns.forEach((col, i) => doc.text(col, 40 + i * colWidth, doc.y, { width: colWidth, continued: i < columns.length - 1 }));
        doc.moveDown(0.5);
        doc.font('Helvetica');

        data.forEach((row) => {
          const y = doc.y;
          columns.forEach((col, i) => {
            doc.text(String(row[col] ?? ''), 40 + i * colWidth, y, { width: colWidth, continued: i < columns.length - 1 });
          });
          doc.moveDown(0.5);
        });
      } else {
        doc.text('No data available for this report.');
      }

      doc.end();
      return undefined;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(type);
    if (data.length) {
      sheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key, width: 20 }));
      sheet.addRows(data);
    }
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment(`${type}-report.xlsx`);
    await workbook.xlsx.write(res);
    return res.end();
  } catch (err) { return next(err); }
}

module.exports = { dashboard, vendorReport, executiveReport, exportReport };
