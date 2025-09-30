import mongoose, { Schema, type Document, type Model } from 'mongoose'

export type TradeSide = 'BUY' | 'SELL'
export type TradeStatus = 'completed' | 'pending' | 'cancelled'

export interface ITrade extends Document {
  userId: string
  symbol: string
  side: TradeSide
  quantity: number
  price: number
  status: TradeStatus
  createdAt: Date
  updatedAt: Date
}

const TradeSchema = new Schema<ITrade>(
  {
    userId: { type: String, required: true, index: true },
    symbol: { type: String, required: true },
    side: { type: String, enum: ['BUY', 'SELL'], required: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['completed', 'pending', 'cancelled'], default: 'completed' },
  },
  { timestamps: true }
)

export const Trade: Model<ITrade> = mongoose.models.Trade || mongoose.model<ITrade>('Trade', TradeSchema)
