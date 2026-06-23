"use strict";
const country_master = require(".././seeders/country_master.json");
const business_category = require(".././seeders/business_category.json");
const ledger_category_group = require(".././seeders/ledger_category_group.json");
const ledger_category_master = require(".././seeders/ledger_category_master.json");
const account_master = require(".././seeders/account_master.json");
const user = require(".././seeders/user.json");
const company = require(".././seeders/company.json");
const blog = require(".././seeders/blog_master.json");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // await queryInterface.bulkInsert("blog_master", blog);
    // await queryInterface.bulkInsert("country_master", country_master);
    // await queryInterface.bulkInsert("business_category", business_category);
    // // await queryInterface.bulkInsert("business_category", business_category);
    // await queryInterface.bulkInsert(
    //   "ledger_category_group",
    //   ledger_category_group
    // );
    // await queryInterface.bulkInsert(
    //   "ledger_category_master",
    //   ledger_category_master
    // );
    //  await queryInterface.bulkInsert("user", user);
  //  await queryInterface.bulkInsert("company_master", company);
   await queryInterface.bulkInsert("account_master", account_master);

    // await queryInterface.bulkInsert("sale_invoice", sale_invoice);
    // await queryInterface.bulkInsert("purchase_invoice", purchase_invoice);
    // await queryInterface.bulkInsert("invoice_items", invoice_items);
    // await queryInterface.bulkInsert("ledger_details", ledger_details);
  },
  async down(queryInterface, Sequelize) {
    console.log("hi chellom");
  },
};
