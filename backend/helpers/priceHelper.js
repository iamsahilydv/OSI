const getProductPrices = async (conn, variation_id) => {
  const [rows] = await conn.query(
    `
    SELECT 
      original,
      discount_percentage,
      currency,
      ROUND(original * (1 - discount_percentage / 100), 2) AS current
    FROM prices
    WHERE variation_id = ?
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [variation_id]
  );

  return rows; // returns array with 1 latest price object
};

module.exports = getProductPrices;
