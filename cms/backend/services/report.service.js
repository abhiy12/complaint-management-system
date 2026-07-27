const reportRepo = require('../repositories/report.repository');

async function dashboard() {
  const [cards, statusCounts, categoryWise, priorityWise, monthlyTrend] = await Promise.all([
    reportRepo.dashboardCards(),
    reportRepo.statusCounts(),
    reportRepo.categoryWise(),
    reportRepo.priorityWise(),
    reportRepo.monthlyTrend()
  ]);
  return { cards, statusCounts, categoryWise, priorityWise, monthlyTrend };
}

async function vendorReport() {
  return reportRepo.vendorWise();
}

async function executiveReport() {
  return reportRepo.executivePerformance();
}

module.exports = { dashboard, vendorReport, executiveReport };
