/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import QRCode from 'qrcode';

/**
 * Generates a Data URL for a QR Code containing specified text.
 */
export async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      margin: 1,
      scale: 8,
      color: {
        dark: '#0f172a', // Slate 900
        light: '#ffffff', // Crisp white
      },
    });
  } catch (error) {
    console.error('Failed to generate QR Code:', error);
    // Return a fallback SVG or empty string
    return '';
  }
}
