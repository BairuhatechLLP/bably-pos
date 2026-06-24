import {StyleSheet} from 'react-native';
import COLORS from '../../config/color';
import FONTS from '../../config/fonts';

const styles = StyleSheet.create({
  homeScreen: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  Box1: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: COLORS?.GREY3,
    borderBottomWidth: 1,
    paddingBottom: 15,
    paddingHorizontal: 5,
  },
  Box2: {
    padding: 16,
    paddingVertical: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  Box3: {
    paddingHorizontal: 16,
  },
  Box4: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 4,
  },
  Box5: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  Box6: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  text1: {
    fontSize: 30,
    fontFamily: FONTS.BOLD,
    color: '#000',
    letterSpacing: 1,
  },
  text2: {
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
    color: 'grey',
  },
  text3: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: COLORS?.GREY7,
  },
  text4: {
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    color: 'grey',
  },
  text5: {
    fontSize: 16,
    fontFamily: FONTS.BOLD,
    color: COLORS?.PRIMARY,
    letterSpacing: 1,
  },
  paymentSection: {
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: 5,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  paymentCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS?.GREY4,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  paymentIconBox: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  paymentMethod: {
    fontSize: 13,
    fontFamily: FONTS.MEDIUM,
    color: '#000',
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 17,
    fontFamily: FONTS.BOLD,
    color: COLORS?.PRIMARY,
    letterSpacing: 0.5,
  },
  paymentCount: {
    fontSize: 11,
    fontFamily: FONTS.REGULAR,
    color: 'grey',
    marginTop: 3,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  compareText: {
    fontSize: 12,
    fontFamily: FONTS.SEMI_BOLD,
    marginLeft: 2,
  },
  compareTextSmall: {
    fontSize: 11,
    fontFamily: FONTS.SEMI_BOLD,
    marginLeft: 2,
  },
  compareSub: {
    fontSize: 11,
    fontFamily: FONTS.REGULAR,
    color: 'grey',
    marginLeft: 2,
  },
  quickLinkRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  quickLinkCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS?.GREY4,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  quickLinkIcon: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  quickLinkLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.MEDIUM,
    color: '#000',
  },
  // ─── HERO TODAY-SALES CARD (compact) ─────────────────────────────────
  heroCard: {
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  heroLabel: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
  heroAmount: {
    fontFamily: FONTS.BOLD,
    fontSize: 22,
    color: '#fff',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  heroOrders: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
  heroDeltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  heroDeltaText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 10,
    color: '#fff',
  },
  // ─── QUICK-LINK GRID (compact horizontal pills) ──────────────────────
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
  },
  quickTile: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    gap: 8,
  },
  quickTileIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTileLabel: {
    flex: 1,
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 12,
    color: COLORS.GREY1,
  },
});

export default styles;
