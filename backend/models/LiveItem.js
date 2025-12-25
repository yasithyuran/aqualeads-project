const mongoose = require('mongoose');

const FISH_SUBTYPES = [
  'planted_large_tank',
  'marine',
  'algae_cleaners',
  'snails',
  'nano_fish',
  'shrimps',
  'crabs',
  'bottom_cleaners',
  'monster_fish',
  'export_only',
  'exotic_fish',
  'other'
];

const PLANT_SUBTYPES = [
  'low_tech',
  'high_tech',
  'paludarium',
  'other'
];

const liveItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    itemType: { type: String, enum: ['fish', 'plant'], required: true },
    subType: { type: String, required: true },
    
    // Optional pricing fields
    price: { type: Number, min: 0 },
    currency: { type: String },
    unit: { type: String },
    
    // Optional availability field
    availability: { type: Boolean },
    
    image: {
      filename: String,
      path: String,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
  },
  { versionKey: false }
);

// Subtype validator by itemType
liveItemSchema.pre('validate', function (next) {
  if (this.itemType === 'fish' && !FISH_SUBTYPES.includes(this.subType)) {
    return next(new Error('Invalid fish subtype'));
  }
  if (this.itemType === 'plant' && !PLANT_SUBTYPES.includes(this.subType)) {
    return next(new Error('Invalid plant subtype'));
  }
  next();
});

liveItemSchema.index({ itemType: 1, subType: 1 });
liveItemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('LiveItem', liveItemSchema);
module.exports.FISH_SUBTYPES = FISH_SUBTYPES;
module.exports.PLANT_SUBTYPES = PLANT_SUBTYPES;