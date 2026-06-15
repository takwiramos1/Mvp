import { Linking } from 'react-native';

const formatPhone = (phone) => {
  if (!phone) return null;
  // Strip everything except digits and leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  // If starts with 0 (Zimbabwe), convert to international format +263
  if (cleaned.startsWith('0') && cleaned.length >= 10) {
    return '263' + cleaned.slice(1);
  }
  // Remove leading +
  return cleaned.replace(/^\+/, '');
};

export const sendWhatsAppReminder = async (customerName, balance, phone, businessName = 'your supplier') => {
  const formattedPhone = formatPhone(phone);

  const message =
    `Hi ${customerName}, this is a friendly reminder from ${businessName}.\n\n` +
    `💰 Your current balance is: $${balance.toFixed(2)}\n\n` +
    `Please come in to settle your account when you can. Thank you! 🙏`;

  const encodedMessage = encodeURIComponent(message);
  let url;

  if (formattedPhone) {
    url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  } else {
    // No phone - open WhatsApp to share screen
    url = `whatsapp://send?text=${encodedMessage}`;
  }

  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
    return true;
  }
  return false;
};

export const sendSMSReminder = async (customerName, balance, phone) => {
  if (!phone) return false;
  const message =
    `Hi ${customerName}, your outstanding balance is $${balance.toFixed(2)}. Please come to settle soon. Thank you.`;
  const url = `sms:${phone}?body=${encodeURIComponent(message)}`;
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
    return true;
  }
  return false;
};

export const callCustomer = async (phone) => {
  if (!phone) return false;
  const url = `tel:${phone}`;
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
    return true;
  }
  return false;
};
