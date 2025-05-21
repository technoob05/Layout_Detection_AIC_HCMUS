"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateText = translateText;
exports.translateImage = translateImage;
exports.translateVideoTranscript = translateVideoTranscript;
exports.transcribeYouTubeVideo = transcribeYouTubeVideo;
exports.detectAndTranslateObjects = detectAndTranslateObjects;
var genai_1 = require("@google/genai");
var generative_ai_1 = require("@google/generative-ai");
// Get API key from environment variables
var API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY';
// Initialize the Gemini API client
var genAI = new genai_1.GoogleGenerativeAI(API_KEY);
// Set up the model configuration
var modelConfig = {
    temperature: 0.4,
    topK: 32,
    topP: 1,
    maxOutputTokens: 2048,
    safetySettings: [
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ],
};
// Latest model for enhanced capabilities
var MODEL_NAME = 'gemini-2.5-flash'; // Using the Gemini 2.5 model
// Helper function to parse JSON responses
var parseGeminiJsonResponse = function (jsonStr, context) {
    var cleanJsonStr = jsonStr.trim();
    var fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    var fenceMatch = cleanJsonStr.match(fenceRegex);
    if (fenceMatch && fenceMatch[1]) {
        cleanJsonStr = fenceMatch[1].trim();
    }
    try {
        var parsedData = JSON.parse(cleanJsonStr);
        return parsedData;
    }
    catch (e) {
        console.error("Failed to parse JSON response for ".concat(context, ":"), cleanJsonStr, e);
        throw new Error("Failed to parse ".concat(context, " data. Raw AI response (truncated): \"").concat(cleanJsonStr.substring(0, 150), "...\""));
    }
};
// Text translation service
function translateText(text, targetLanguage) {
    return __awaiter(this, void 0, void 0, function () {
        var model, prompt_1, result, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    model = genAI.getGenerativeModel(__assign({ model: MODEL_NAME }, modelConfig));
                    prompt_1 = "Translate the following text accurately into ".concat(targetLanguage, ":\n\"").concat(text, "\"\nRespond ONLY with the translated text. Do not include the original text, any explanations, introductory phrases, or any quotation marks around your response.");
                    return [4 /*yield*/, model.generateContent(prompt_1)];
                case 1:
                    result = _a.sent();
                    response = result.response;
                    return [2 /*return*/, response.text().trim()];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error translating text:', error_1);
                    throw new Error('Failed to translate text');
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Image translation service (OCR + translation)
function translateImage(imageBase64, targetLanguage) {
    return __awaiter(this, void 0, void 0, function () {
        var model, prompt_2, imagePart, result, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    model = genAI.getGenerativeModel(__assign({ model: MODEL_NAME }, modelConfig));
                    prompt_2 = "You are an expert multilingual OCR and translation system.\nAnalyze the provided image to identify all text.\nTranslate all identified text into ".concat(targetLanguage, ".\nReturn ONLY the translated text content, preserving the original formatting as much as possible.\nDo not include any explanations, introductions, or notes.");
                    imagePart = {
                        inlineData: {
                            data: imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''),
                            mimeType: imageBase64.includes('data:image/png') ? 'image/png' : 'image/jpeg',
                        },
                    };
                    return [4 /*yield*/, model.generateContent([prompt_2, imagePart])];
                case 1:
                    result = _a.sent();
                    response = result.response;
                    return [2 /*return*/, response.text().trim()];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error translating image:', error_2);
                    throw new Error('Failed to translate image');
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Video transcript translation
function translateVideoTranscript(transcript, targetLanguage) {
    return __awaiter(this, void 0, void 0, function () {
        var model, prompt_3, result, response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    model = genAI.getGenerativeModel(__assign({ model: MODEL_NAME }, modelConfig));
                    prompt_3 = "Translate the following video transcript accurately into ".concat(targetLanguage, ":\n\"").concat(transcript, "\"\nPreserve formatting, paragraph breaks, and speaker indications if present.\nRespond ONLY with the translated transcript.");
                    return [4 /*yield*/, model.generateContent(prompt_3)];
                case 1:
                    result = _a.sent();
                    response = result.response;
                    return [2 /*return*/, response.text().trim()];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error translating video transcript:', error_3);
                    throw new Error('Failed to translate video transcript');
                case 3: return [2 /*return*/];
            }
        });
    });
}
// YouTube video transcription
function transcribeYouTubeVideo(youtubeUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var model, prompt_4, videoPart, result, response, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!youtubeUrl.trim() || !youtubeUrl.includes('youtube.com/watch?v=')) {
                        throw new Error('Invalid YouTube URL');
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    model = genAI.getGenerativeModel(__assign({ model: MODEL_NAME }, modelConfig));
                    prompt_4 = "Transcribe the spoken audio from this YouTube video. \nProvide a clean, narrative transcript. \nAvoid including timestamps directly within the flow of dialogue.\nIf there are distinct visual events crucial for understanding the spoken content, \nyou can note them as [Visual: description], but focus primarily on the speech.";
                    videoPart = {
                        fileData: {
                            fileUri: youtubeUrl,
                        },
                    };
                    return [4 /*yield*/, model.generateContent([videoPart, { text: prompt_4 }])];
                case 2:
                    result = _a.sent();
                    response = result.response;
                    return [2 /*return*/, response.text().trim()];
                case 3:
                    error_4 = _a.sent();
                    console.error('Error transcribing YouTube video:', error_4);
                    throw new Error('Failed to transcribe YouTube video. The video might be too long, or there may be an issue with the YouTube URL.');
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Image object detection with translation
function detectAndTranslateObjects(imageBase64, targetLanguage) {
    return __awaiter(this, void 0, void 0, function () {
        var model, prompt_5, imagePart, result, response, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    model = genAI.getGenerativeModel(__assign({ model: MODEL_NAME }, modelConfig));
                    prompt_5 = "You are an expert visual object identifier and multilingual translator.\nAnalyze the provided image and identify up to 5-7 prominent, distinct, and clearly recognizable physical objects.\nFor each identified object, provide:\n1. The common English name of the object\n2. Its accurate translation into ".concat(targetLanguage, "\n3. Optionally, a very brief interesting cultural note about the object, if applicable\n\nFormat your response as a simple list with bullet points.");
                    imagePart = {
                        inlineData: {
                            data: imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''),
                            mimeType: imageBase64.includes('data:image/png') ? 'image/png' : 'image/jpeg',
                        },
                    };
                    return [4 /*yield*/, model.generateContent([prompt_5, imagePart])];
                case 1:
                    result = _a.sent();
                    response = result.response;
                    return [2 /*return*/, response.text().trim()];
                case 2:
                    error_5 = _a.sent();
                    console.error('Error detecting and translating objects:', error_5);
                    throw new Error('Failed to detect and translate objects');
                case 3: return [2 /*return*/];
            }
        });
    });
}
