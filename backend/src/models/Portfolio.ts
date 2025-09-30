import mongoose from 'mongoose'

const portfolioSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 100000.0 },
    // symbol -> shares
    portfolio: { type: Map, of: Number, default: {} },
    // symbol -> average entry price (for unrealized P&L)
    avgPrices: { type: Map, of: Number, default: {} },
    // accumulated realized P&L from closed trades
    realizedPnl: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export type PortfolioDoc = mongoose.InferSchemaType<typeof portfolioSchema>

portfolioSchema.set('toObject', { flattenMaps: true })
portfolioSchema.set('toJSON', { flattenMaps: true })

export const Portfolio = mongoose.model('Portfolio', portfolioSchema)
