import {StyleSheet} from 'react-native';
import COLOR from '../../config/color';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLOR.TEXT_PRIMARY,
    marginTop: 20,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLOR.TEXT_PRIMARY,
    marginBottom: 8,
  },
  branchSelector: {
    borderWidth: 1,
    borderColor: COLOR.BORDER,
    borderRadius: 8,
    padding: 15,
    backgroundColor: COLOR.BACKGROUND,
  },
  branchText: {
    fontSize: 16,
    color: COLOR.TEXT_PRIMARY,
  },
  branchTextPlaceholder: {
    fontSize: 16,
    color: COLOR.GREY2,
  },
  helperText: {
    fontSize: 12,
    color: COLOR.GREY2,
    marginTop: 5,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLOR.BORDER,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: COLOR.PRIMARY,
    borderColor: COLOR.PRIMARY,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLOR.TEXT_PRIMARY,
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  infoBox: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFC107',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  infoText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
});

export default styles;
