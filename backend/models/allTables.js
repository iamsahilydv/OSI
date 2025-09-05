const createCartTable = require("./cartTable");
const createCategoryTable = require("./categoryTable");
const createCustomerReviewsTable = require("./customerReviewsTable");
const createPriceTable = require("./priceTable");
const createProductFeaturesTable = require("./productFeaturesTable");
const createProductSpecificationsTable = require("./productSpecifications");
const createProductTabaleModel = require("./productsTable");
const createProfileImgTable = require("./profileImgTable");
const createRatingTable = require("./ratingTable");
const createReferPaymentTable = require("./referPaymentsTable");
const createStagesTable = require("./stagesTable");
const subscriptionPaymentTable = require("./subscriptionPaymentTable");
const createSubscribeTable = require("./subscriptionTable");
const subscription_payment_historyTableCreate = require("./subscription_payment_historyTable");
const createUserTable = require("./userTable");
const createWithdrawlTable = require("./transactionTable");
const createOrderTable = require("./OrderTable");
const {
  createUserBankDetailsTable,
  createUserUpiDetailsTable,
} = require("./bankDetails");
const createAddressTable = require("./address");
const createQikinkPodDetailsAndVariationsTable = require("./productPodDetails");
const createProductImgTable = require("./productImgTable");
const createProductVariationTable = require("./productVariationTable");
const createCategoryAttributesTable = require("./categoryAttributesTable");
const { createAllEnhancedTables } = require("./enhancedProductTable");


const createAllTables = async () => {
  try {
    // Keep existing working tables
    await createUserTable();
    await createAddressTable();
    await createOrderTable();
    await createProfileImgTable();
    await createCustomerReviewsTable();
    await createProductFeaturesTable();
    await createProductSpecificationsTable();
    await createReferPaymentTable();
    await createStagesTable();
    await subscriptionPaymentTable();
    await subscription_payment_historyTableCreate();
    await createUserBankDetailsTable();
    await createUserUpiDetailsTable();
    await createWithdrawlTable();

    // Create all enhanced tables
    await createAllEnhancedTables();

    console.log("✅ All tables created successfully");
  } catch (error) {
    console.log({ AllTableCreationError: error.message });
  }
};
module.exports = createAllTables;
