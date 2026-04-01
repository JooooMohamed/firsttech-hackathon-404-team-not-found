import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {Camera, CameraType} from 'react-native-camera-kit';
import {COLORS, SPACING, FONT_SIZE} from '../constants';

interface QrScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const QrScanner: React.FC<QrScannerProps> = ({
  onScan,
  onClose,
  title = 'Scan QR Code',
  subtitle = 'Point your camera at the QR code',
}) => {
  const [scanned, setScanned] = useState(false);

  const handleRead = useCallback(
    (event: any) => {
      if (scanned) return;
      const code =
        event?.nativeEvent?.codeStringValue || event?.nativeEvent?.rawData;
      if (code) {
        setScanned(true);
        onScan(code);
      }
    },
    [scanned, onScan],
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          cameraType={CameraType.Back}
          scanBarcode={true}
          onReadCode={handleRead}
          showFrame={false}
        />
        {/* Overlay with cutout */}
        <View style={styles.overlay}>
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scanArea}>
              {/* Corner markers */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom} />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {scanned ? (
          <TouchableOpacity
            style={styles.rescanBtn}
            onPress={() => setScanned(false)}>
            <Text style={styles.rescanText}>🔄 Tap to Scan Again</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.footerText}>
            📷 Position the QR code within the frame
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const SCAN_SIZE = 250;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? SPACING.sm : SPACING.lg,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: '#FFF',
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: SCAN_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scanArea: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    backgroundColor: 'transparent',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 4,
  },
  footer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  rescanBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  rescanText: {
    color: '#FFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
});
