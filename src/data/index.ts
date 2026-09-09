import type { RawEpic, RawHexTile } from '../types'
import internalExecutionRaw from '../../data/internal_execution.json'
import marketIntelRaw from '../../data/market_intel.json'
import userSegmentsIntelRaw from '../../data/user_segments_market_intel.json'

export const internalExecutionData = internalExecutionRaw as RawEpic[]
export const marketIntelData = marketIntelRaw as RawHexTile[]
export const userSegmentsIntelData = userSegmentsIntelRaw as RawHexTile[]
