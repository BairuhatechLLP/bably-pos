const moment = require('moment');

async function formatDate(date) {
  const format = `YYYY-MM-DD HH:mm:ss`;
  const formated = moment(date || new Date(), format)
    .utcOffset(0, true)
    .toDate();
  return formated;
}

async function testDates() {
  const date = new Date();
  console.log('Current date:', date);
  console.log('Current date ISO:', date.toISOString());

  const startDate = await formatDate(moment(date).startOf('day'));
  const endDate = await formatDate(moment(date).endOf('day'));

  console.log('\n=== FORMATTED DATES ===');
  console.log('startDate:', startDate);
  console.log('startDate ISO:', startDate.toISOString());
  console.log('endDate:', endDate);
  console.log('endDate ISO:', endDate.toISOString());

  console.log('\n=== CORRECT DATES (Should be) ===');
  const correctStart = moment().utc().startOf('day').toDate();
  const correctEnd = moment().utc().endOf('day').toDate();
  console.log('correctStart:', correctStart);
  console.log('correctStart ISO:', correctStart.toISOString());
  console.log('correctEnd:', correctEnd);
  console.log('correctEnd ISO:', correctEnd.toISOString());
}

testDates();
