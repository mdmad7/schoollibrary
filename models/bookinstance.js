import mongoose, { Schema } from 'mongoose';
import moment from 'moment';

var BookInstanceSchema = new Schema(
  {
    book: { type: Schema.ObjectId, ref: 'Book', required: true }, //reference to the associated book
    imprint: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
      default: 'Maintenance',
    },
    due_back: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Virtual for bookinstance's URL
BookInstanceSchema.virtual('url').get(function() {
  return '/catalog/bookinstance/' + this._id;
});

BookInstanceSchema.virtual('due_back_formatted').get(function() {
  return moment(this.due_back).format('MMMM Do, YYYY');
});

//Export model
export default mongoose.model('BookInstance', BookInstanceSchema);
