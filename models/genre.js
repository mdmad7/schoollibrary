import mongoose, { Schema } from 'mongoose';

var GenreSchema = new Schema(
  {
    name: { type: String, required: true, min: 3, max: 100 },
  },
  { timestamps: true },
);

// Virtual for bookinstance's URL
GenreSchema.virtual('url').get(function() {
  return '/catalog/genre/' + this._id;
});

//Export model
export default mongoose.model('Genre', GenreSchema);
