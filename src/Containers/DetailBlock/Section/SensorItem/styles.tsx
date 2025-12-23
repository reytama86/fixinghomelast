import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  gridItem: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '400',
    fontFamily: 'SpaceGrotesk-Regular',
    color: '#6B7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-Medium',
    color: '#1F2937',
  },
  statExtra: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  statStatus: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'SpaceGrotesk-Medium',
  },
});