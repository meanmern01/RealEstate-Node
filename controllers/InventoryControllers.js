const InventoryDetails = require("../models/inventoryDetails");
const CoreProductInfo = require("../models/coreProductInformation");
const CartonInfo = require("../models/cartonInformation");
const ProductPricing = require("../models/productPricing");
const ExtraProductInfo = require("../models/extraProductInfo");

const querystring = require("querystring");

const getProducts = async (req, res) => {
  let page = req.query.page;
  let limit = req.query.limit;
  let category = req.body.category;
  console.log("page", page);
  var splitStr = category.toLowerCase().split(", ");
  console.log("splitStr-=-=", splitStr);

  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] = {
      "grouping.category": {
        $regex: `.*${splitStr[i]}*.`,
        $options: "i",
      },
    };
  }
  // console.log("splitStr-=-=", splitStr);
  //  { $regex: `.*${category}*.`, $options: "i" }
  let totalDocs;
  await CoreProductInfo.aggregate(
    [
      {
        $match: {
          $or: splitStr,
        },
      },
      { $count: "totalProducts" },
    ],
    (err, docs) => {
      if (err) {
        // res.status(404).json({ message: err.message, success: false });
      } else {
        totalDocs = docs[0].totalProducts;
        // res.status(200).json({ message: docs, success: true });
      }
    }
  );
  try {
    CoreProductInfo.aggregate(
      [
        {
          $match: {
            $or: splitStr,
          },
        },
        {
          $lookup: {
            from: "inventorydetails",
            localField: "UPC",
            foreignField: "UPC_Code",
            as: "InventoryDetails",
          },
        },
        {
          $lookup: {
            from: "productpricings",
            localField: "UPC",
            foreignField: "UPC",
            as: "pricing",
          },
        },
        { $unwind: "$InventoryDetails" },
        {
          $project: {
            _id: 1,

            SEO: 1,

            Materials: 1,
            productImagesLinks: 1,
            MOE_item: 1,
            MOE_productName: 1,
            UPC: 1,
            dimension: 1,
            grouping: 1,
            warrantyCompliance: 1,
            InventoryDetails: 1,
            pricing: 1,
            InStock: {
              $or: [
                { $gt: ["$InventoryDetails.Stock_WA", 0] },
                { $gt: ["$InventoryDetails.Stock_NJ", 0] },
              ],
            },
          },
        },
        { $sort: { InStock: -1, _id: 1 } },
        // {
        //   $match: {
        //     $expr: {
        //       $or: [
        //         { $gt: ["$InventoryDetails.Stock_WA", 0] },
        //         { $gt: ["$InventoryDetails.Stock_NJ", 0] },
        //       ],
        //     },
        //   },
        // },
        { $skip: parseInt(page) * 12 },
        { $limit: parseInt(12) },
      ],
      (err, docs) => {
        if (err) {
          res.status(404).json({ message: err.message, success: false });
        } else {
          console.log(totalDocs);
          res.status(200).json({ message: { docs, totalDocs }, success: true });
        }
      }
    );
  } catch (error) {
    res.status(404).json({ message: error.message, success: false });
  }
};
const getProduct = async (req, res) => {
  try {
    CoreProductInfo.aggregate(
      [
        {
          $match: {
            MOE_item: req.body.itemId,
          },
        },
        {
          $lookup: {
            from: "inventorydetails",
            localField: "UPC",
            foreignField: "UPC_Code",
            as: "InventoryDetails",
          },
        },
        {
          $lookup: {
            from: "productpricings",
            localField: "UPC",
            foreignField: "UPC",
            as: "pricing",
          },
        },
        { $unwind: "$InventoryDetails" },
      ],
      (err, docs) => {
        if (err) {
          res.status(404).json({ message: err.message, success: false });
        } else {
          console.log("docs", docs);
          res.status(200).json({ message: docs[0], success: true });
        }
      }
    );
  } catch (error) {
    res.status(404).json({ message: error.message, success: false });
  }
};
const searchProducts = async (req, res) => {
  let page = req.query.page;
  let limit = req.query.limit;
  let category = req.body.category;
  let searchTermBody = req.body.searchTerm;
  console.log("searchTerm", searchTermBody);
  var splitStr = category.toLowerCase().split(", ");
  var searchTerm = searchTermBody.toLowerCase().split(" ");
  var searchTermMOE_productName = searchTermBody.toLowerCase().split(" ");
  var searchTermRegex = searchTermBody.toLowerCase().split(" ");
  var searchTermColor = searchTermBody.toLowerCase().split(" ");

  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] = {
      "grouping.category": {
        $regex: `.*${splitStr[i]}*.`,
        $options: "i",
      },
    };
  }
  for (var i = 0; i < searchTerm.length; i++) {
    searchTerm[i] = {
      "SEO.searchKeywords": {
        $regex: `.*${searchTerm[i]}*.`,
        $options: "i",
      },
    };
  }
  for (var i = 0; i < searchTermMOE_productName.length; i++) {
    searchTermMOE_productName[i] = {
      MOE_productName: {
        $regex: `.*${searchTermMOE_productName[i]}*.`,
        $options: "i",
      },
    };
  }
  for (var i = 0; i < searchTermColor.length; i++) {
    searchTermColor[i] = {
      "grouping.color": {
        $regex: `.*${searchTermColor[i]}*.`,
        $options: "i",
      },
    };
  }

  let regex = searchTermRegex.map(function (e) {
    return new RegExp(e, "i");
  });
  let totalDocs;
  await CoreProductInfo.aggregate(
    [
      {
        $match: {
          $and: [
            { $or: splitStr },
            {
              $or: [
                {
                  $or: searchTerm,
                  // "SEO.searchKeywords": {
                  //   $regex: `.*${searchTermBody}*.`,
                  //   $options: "i",
                  // },
                },
                {
                  $or: searchTermMOE_productName,
                  // MOE_productName: {
                  //   $regex: `.*${searchTermBody.toLowerCase()}*.`,
                  //   $options: "i",
                  // },
                },
                { $or: searchTermColor },
                { Materials: { $in: regex } },
                { "SEO.featuresBenefits": { $in: regex } },
              ],
            },
          ],
        },
      },
      { $count: "totalProducts" },
    ],
    (err, docs) => {
      if (err) {
        // res.status(404).json({ message: err.message, success: false });
      } else {
        // console.log(docs);
        totalDocs = docs[0].totalProducts;
        // res.status(200).json({ message: docs, success: true });
      }
    }
  );
  try {
    CoreProductInfo.aggregate(
      [
        {
          $match: {
            $and: [
              { $or: splitStr },
              {
                $or: [
                  {
                    $or: searchTerm,
                    // "SEO.searchKeywords": {
                    //   $regex: `.*${searchTermBody}*.`,
                    //   $options: "i",
                    // },
                  },
                  {
                    $or: searchTermMOE_productName,
                    // MOE_productName: {
                    //   $regex: `.*${searchTermBody.toLowerCase()}*.`,
                    //   $options: "i",
                    // },
                  },
                  { $or: searchTermColor },
                  { Materials: { $in: regex } },
                  { "SEO.featuresBenefits": { $in: regex } },
                ],
              },
            ],
          },
        },
        {
          $lookup: {
            from: "inventorydetails",
            localField: "UPC",
            foreignField: "UPC_Code",
            as: "InventoryDetails",
          },
        },
        {
          $lookup: {
            from: "productpricings",
            localField: "UPC",
            foreignField: "UPC",
            as: "pricing",
          },
        },
        { $unwind: "$InventoryDetails" },
        {
          $project: {
            _id: 1,

            SEO: 1,

            Materials: 1,
            productImagesLinks: 1,
            MOE_item: 1,
            MOE_productName: 1,
            UPC: 1,
            dimension: 1,
            grouping: 1,
            warrantyCompliance: 1,
            InventoryDetails: 1,
            pricing: 1,
            InStock: {
              $or: [
                { $gt: ["$InventoryDetails.Stock_WA", 0] },
                { $gt: ["$InventoryDetails.Stock_NJ", 0] },
              ],
            },
          },
        },
        { $sort: { InStock: -1, _id: 1 } },
        // {
        //   $match: {
        //     $expr: {
        //       $or: [
        //         { $gt: ["$InventoryDetails.Stock_WA", 0] },
        //         { $gt: ["$InventoryDetails.Stock_NJ", 0] },
        //       ],
        //     },
        //   },
        // },
        { $skip: parseInt(page) * 12 },
        { $limit: parseInt(12) },
      ],
      (err, docs) => {
        if (err) {
          res.status(404).json({ message: err.message, success: false });
        } else {
          console.log(totalDocs);
          res.status(200).json({ message: { docs, totalDocs }, success: true });
        }
      }
    );
  } catch (error) {
    res.status(404).json({ message: error.message, success: false });
  }
};
const getProductsWithoutPagination = async (req, res) => {
  console.log("getProductsWithoutPagination", req.body);
  let category = req.body.category;
  var splitStr = category.toLowerCase().split(", ");
  console.log("splitStr getProductsWithoutPagination-=-=", splitStr);

  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] = {
      "grouping.category": {
        $regex: `.*${splitStr[i]}*.`,
        $options: "i",
      },
    };
  }
  // console.log("splitStr-=-=", splitStr);
  //  { $regex: `.*${category}*.`, $options: "i" }
  let totalDocs;
  await CoreProductInfo.aggregate(
    [
      {
        $match: {
          $or: splitStr,
        },
      },
      { $count: "totalProducts" },
    ],
    (err, docs) => {
      if (err) {
        // res.status(404).json({ message: err.message, success: false });
      } else {
        totalDocs = docs[0].totalProducts;
        // res.status(200).json({ message: docs, success: true });
      }
    }
  );
  try {
    CoreProductInfo.aggregate(
      [
        {
          $match: {
            $or: splitStr,
          },
        },
        {
          $lookup: {
            from: "inventorydetails",
            localField: "UPC",
            foreignField: "UPC_Code",
            as: "InventoryDetails",
          },
        },
        {
          $lookup: {
            from: "productpricings",
            localField: "UPC",
            foreignField: "UPC",
            as: "pricing",
          },
        },
        { $unwind: "$InventoryDetails" },
        {
          $project: {
            _id: 1,

            SEO: 1,

            Materials: 1,
            productImagesLinks: 1,
            MOE_item: 1,
            MOE_productName: 1,
            UPC: 1,
            dimension: 1,
            grouping: 1,
            warrantyCompliance: 1,
            InventoryDetails: 1,
            pricing: 1,
            InStock: {
              $or: [
                { $gt: ["$InventoryDetails.Stock_WA", 0] },
                { $gt: ["$InventoryDetails.Stock_NJ", 0] },
              ],
            },
          },
        },
        { $sort: { InStock: -1, _id: 1 } },
        // {
        //   $match: {
        //     $expr: {
        //       $or: [
        //         { $gt: ["$InventoryDetails.Stock_WA", 0] },
        //         { $gt: ["$InventoryDetails.Stock_NJ", 0] },
        //       ],
        //     },
        //   },
        // },
      ],
      (err, docs) => {
        if (err) {
          res.status(404).json({ message: err.message, success: false });
        } else {
          console.log(totalDocs);
          res.status(200).json({ message: { docs, totalDocs }, success: true });
        }
      }
    );
  } catch (error) {
    res.status(404).json({ message: error.message, success: false });
  }
};
module.exports = { getProducts, getProduct, searchProducts, getProductsWithoutPagination };
