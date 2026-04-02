const mongoose = require("mongoose");
const { RECORD_TYPES, CATEGORIES } = require("../config/constants");

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: {
        values: Object.values(RECORD_TYPES),
        message: "Type must be either income or expense",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: CATEGORIES,
        message: `Category must be one of: ${CATEGORIES.join(", ")}`,
      },
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      validate: {
        validator: function (val) {
          return val <= new Date();
        },
        message: "Date cannot be in the future",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for common queries — speeds up filtering and sorting
recordSchema.index({ type: 1, category: 1, date: -1 });
recordSchema.index({ createdBy: 1 });
recordSchema.index({ isDeleted: 1 });

// By default, exclude soft-deleted records from queries
recordSchema.pre(/^find/, function () {
  // only apply if the query hasn't explicitly asked for deleted records
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
});

module.exports = mongoose.model("Record", recordSchema);
