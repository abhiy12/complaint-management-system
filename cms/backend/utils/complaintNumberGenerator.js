// Format: CMP-YYYYMMDD-XXXX (XXXX = zero-padded daily sequence)
function buildComplaintNumber(sequenceForToday) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seq = String(sequenceForToday).padStart(4, '0');
  return `CMP-${y}${m}${d}-${seq}`;
}

module.exports = { buildComplaintNumber };
