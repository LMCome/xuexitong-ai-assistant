// ==UserScript==
// @name         学习通AI助手
// @namespace    askAuto
// @version      2.2.1
// @author       XZS
// @description  学习通AI答题助手，支持DeepSeek/OpenAI/Kimi/智谱GLM/通义千问多模型一键接入
// @icon         https://vitejs.dev/logo.svg
// @updateURL    https://cdn.jsdelivr.net/gh/LMCome/xuexitong-ai-assistant@main/xuexitong-ai-assistant.user.js
// @downloadURL   https://cdn.jsdelivr.net/gh/LMCome/xuexitong-ai-assistant@main/xuexitong-ai-assistant.user.js
// @match        *://*.chaoxing.com/*
// @match        *://*.edu.cn/*
// @match        *://*.nbdlib.cn/*
// @match        *://*.hnsyu.net/*
// @match        *://*.gdhkmooc.com/*
// @require      https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.global.prod.js
// @require      https://cdn.jsdelivr.net/npm/vue-demi@0.14.0/lib/index.iife.js
// @require      data:application/javascript,window.Vue%3DVue%3B
// @require      https://cdn.jsdelivr.net/npm/pinia@2.1.6/dist/pinia.iife.prod.js
// @require      https://cdn.jsdelivr.net/npm/element-plus@2.3.12/dist/index.full.min.js
// @require      https://cdn.jsdelivr.net/npm/blueimp-md5@2.19.0/js/md5.min.js
// @require      https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js
// @resource     element-plus  https://cdn.jsdelivr.net/npm/element-plus@2.3.12/dist/index.css
// @resource     ttf           https://www.forestpolice.org/ttf/2.0/table.json
// @connect      cx.icodef.com
// @connect      tk.enncy.cn
// @connect      api.muketool.com
// @connect      api.tikuhai.com
// @connect      api.deepseek.com
// @connect      api.openai.com
// @connect      api.moonshot.cn
// @connect      open.bigmodel.cn
// @connect      dashscope.aliyuncs.com
// @connect      cdn.jsdelivr.net
// @connect      raw.githubusercontent.com
// @connect      *
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_info
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-end
// @antifeature  ads      脚本可能包含第三方接口广告
// @antifeature  payment  脚本存在第三方答题接口付费功能
// ==/UserScript==

(async function(vue, pinia, element_plus, jquery, blueimp_md5) {
	"use strict";
	var __create = Object.create;
	var __defProp$1 = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) __defProp$1(to, key, {
				get: ((k) => from[k]).bind(null, key),
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp$1(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));
	pinia = __toESM(pinia);
	element_plus = __toESM(element_plus);
	jquery = __toESM(jquery);
	blueimp_md5 = __toESM(blueimp_md5);
	var _GM_addStyle = (() => typeof GM_addStyle != "undefined" ? GM_addStyle : void 0)();
	var _GM_getResourceText = (() => typeof GM_getResourceText != "undefined" ? GM_getResourceText : void 0)();
	var _GM_getValue = (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
	var _GM_info = (() => typeof GM_info != "undefined" ? GM_info : void 0)();
	var _GM_setValue = (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
	var _GM_xmlhttpRequest = (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
	var _unsafeWindow = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)();
	var cssLoader = (name) => _GM_addStyle(_GM_getResourceText(name));
	cssLoader("element-plus");
	var getConfig = () => {
		return _GM_getValue("config") || defaultConfig$1;
	};
	var defaultConfig$1 = {
		debugger: false,
		autoAnswer: true,
		autoVideo: true,
		autoJump: true,
		autoSubmit: true,
		thtoken: "",
		yztoken: "",
		gptKey: "",
		gptModel: "deepseek-chat",
		gptBaseURL: "https://api.deepseek.com/v1",
		gptService: "DeepSeek",
		gpt: false,
		gptType: [
			"0",
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7"
		],
		interval: 3,
		answerInterval: 3,
		minAccuracy: .8,
		autoExam: true,
		hideExam: false,
		notice: "本脚本仅供学习交流使用，严禁用于商业用途，否则后果自负！"
	};
	/* ============================================================
	 * 自定义增强模块（v2.2.0 稳定性更新）
	 * AI 服务商预设 / AI 兜底答题 / 版本检查提示
	 * ============================================================ */
	var AI_PROVIDERS = [
		{ name: "DeepSeek", baseURL: "https://api.deepseek.com/v1", model: "deepseek-chat", note: "国内直连" },
		{ name: "OpenAI", baseURL: "https://api.openai.com/v1", model: "gpt-4o-mini", note: "需网络代理" },
		{ name: "Kimi", baseURL: "https://api.moonshot.cn/v1", model: "kimi-k3", note: "模型ID请以官方实际为准" },
		{ name: "智谱GLM", baseURL: "https://open.bigmodel.cn/api/paas/v4", model: "glm-4-flash-250414", note: "免费模型，ID请以官方实际为准" },
		{ name: "通义千问", baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1", model: "qwen-plus", note: "模型ID请以官方实际为准" }
	];
	var userConfig = [
		{
			name: "base",
			label: "基础配置",
			config: [
				{
					name: "interval",
					label: "通用间隔(秒)",
					type: "number",
					value: defaultConfig$1.interval,
					desc: "通用间隔，用于脚本运行切换"
				},
				{
					name: "answerInterval",
					label: "答题间隔(秒)",
					type: "number",
					value: defaultConfig$1.answerInterval,
					desc: "控制答题速度"
				},
				{
					name: "thtoken",
					label: "题库海秘钥",
					type: "input",
					value: defaultConfig$1.thtoken,
					desc: "非必填，购买后可获得，填写完请保存再刷新页面"
				},
				{
					name: "yztoken",
					label: "一之题库秘钥",
					type: "input",
					value: defaultConfig$1.yztoken,
					desc: "非必填，购买后可获得，填写完请保存再刷新页面"
				}
			]
		},
		{
			name: "chapter",
			label: "章节配置",
			config: [
				{
					name: "autoAnswer",
					label: "自动答题",
					type: "switch",
					value: defaultConfig$1.autoAnswer,
					desc: "开启后，会自动答题"
				},
				{
					name: "autoVideo",
					label: "自动视频",
					type: "switch",
					value: defaultConfig$1.autoVideo,
					desc: "开启后，会自动观看视频"
				},
				{
					name: "autoJump",
					label: "自动切换",
					type: "switch",
					value: defaultConfig$1.autoVideo,
					desc: "开启后，会自动切换章节"
				},
				{
					name: "autoSubmit",
					label: "自动提交",
					type: "switch",
					value: defaultConfig$1.autoSubmit,
					desc: "开启后，会自动提交答案"
				},
				{
					name: "minAccuracy",
					label: "最低正确率",
					type: "input",
					value: defaultConfig$1.minAccuracy,
					desc: "不满足最低正确率则不会自动提交答案"
				}
			]
		},
		{
			name: "exam",
			label: "作业/考试配置",
			config: [{
				name: "autoExam",
				label: "考试自动切换",
				type: "switch",
				value: defaultConfig$1.autoExam,
				desc: "开启后，会考试会自动切换"
			}]
		},
		{
			name: "ai",
			label: "AI答题",
			config: [
				{
					name: "gpt",
					label: "启用AI答题",
					type: "switch",
					value: defaultConfig$1.gpt,
					desc: "开启后，题库找不到答案时自动用AI回答"
				},
				{
					name: "gptService",
					label: "AI服务商",
					type: "select",
					value: defaultConfig$1.gptService,
					desc: "选择后自动填入接口地址与默认模型，模型ID请以官方实际为准"
				},
				{
					name: "gptBaseURL",
					label: "API地址",
					type: "input",
					value: defaultConfig$1.gptBaseURL,
					desc: "选择服务商自动带出，也可手动修改"
				},
				{
					name: "gptModel",
					label: "模型名称",
					type: "input",
					value: defaultConfig$1.gptModel,
					desc: "默认模型ID，请以官方实际为准，可手动修改"
				},
				{
					name: "gptKey",
					label: "API Key",
					type: "input",
					value: defaultConfig$1.gptKey,
					desc: "在对应AI平台申请的API密钥"
				}
			]
		}
	];
	var useformStore = pinia.defineStore({
		id: "formstore",
		state: () => ({
			forminput: getConfig(),
			dialogV: false,
			activeName: "base"
		}),
		actions: { saveConfig(forminput) {
			_GM_setValue("config", forminput);
		} }
	});
	var log = (data, type = "info") => {
		var _a;
		const style = `color: ${{
			info: "orange",
			success: "green",
			error: "red"
		}[type]}; font-weight: bold;`;
		if (Array.isArray(data) || "object" == typeof data ? console.log(`%c${JSON.stringify(data, null, 2)}`, style) : console.log(`%c${data}`, style), defaultConfig$1.debugger) {
			const caller = (((_a = new Error().stack) == null ? void 0 : _a.split("\n")) || [])[2].trim();
			console.log(`${caller}`);
		}
	};
	var sleep = (time) => new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, 1e3 * time);
	});
	var waitIframeLoaded = (iframe) => new Promise((resolve) => {
		const timer = setInterval(() => {
			var _a;
			iframe.contentDocument && "complete" === ((_a = iframe.contentDocument) == null ? void 0 : _a.readyState) ? (clearInterval(timer), resolve()) : iframe.addEventListener("load", () => {
				clearInterval(timer), resolve();
			});
		}, 100);
	});
	var waitElementLoaded = (iframeWindow, selector) => new Promise((resolve) => {
		const timer = setInterval(() => {
			iframeWindow.document.querySelector(selector) && (clearInterval(timer), resolve());
		}, 100);
	});
	var useAskStore = pinia.defineStore({
		id: "ask",
		state: () => ({
			dialogVisible: true,
			count: 0,
			questionList: [],
			task: {
				name: "暂未加载",
				work: {
					questionList: [],
					inx: 0
				},
				video: [],
				log: [],
				status: ""
			}
		}),
		actions: {
			reset() {
				this.task.name = "暂未加载", this.task.work = {
					questionList: [],
					inx: 0
				}, this.task.video = [], this.task.status = "", this.count = 0;
			},
			select(index) {
				this.task.work.questionList[index].selected = true, this.task.work.inx = index;
				try {
					this.task.work.questionList[index].dom.scrollIntoView({ block: "center" });
				} catch (e) {
					log(e, "error");
				}
			},
			get(index) {
				return this.task.work.questionList[index];
			},
			insert(question) {
				this.task.work.questionList.push(question);
			},
			update(index, question) {
				this.task.work.questionList[index] = question;
			},
			log(msg, level = "info") {
				this.task.log.length > 20 && this.task.log.shift(), this.task.log.push({
					time: new Date().toLocaleTimeString(),
					msg,
					type: level
				});
			},
			msg(msg) {
				this.task.status = msg;
			}
		}
	});
	var POSITION_KEY = "manfen:panel-position";
	var DRAG_THRESHOLD = 5;
	function readPosition() {
		try {
			const saved = _GM_getValue(POSITION_KEY);
			if (Number.isFinite(saved?.left) && Number.isFinite(saved?.top)) return saved;
		} catch {}
		return null;
	}
	function useFloatingPanel(panel, launcher, visible) {
		const saved = readPosition();
		const position = (0, vue.ref)(saved ? {
			left: `${saved.left}px`,
			top: `${saved.top}px`
		} : {
			right: "20px",
			top: "72px"
		});
		const dragging = (0, vue.ref)(false);
		let origin;
		let observer;
		let ownerWindow;
		let suppressLauncherClick = false;
		const activeElement = () => visible.value ? panel.value : launcher.value;
		function place(left, top) {
			const element = activeElement();
			if (!element?.getClientRects().length || !ownerWindow) return;
			const rect = element.getBoundingClientRect();
			const maxX = Math.max(12, ownerWindow.innerWidth - rect.width - 12);
			const maxY = Math.max(12, ownerWindow.innerHeight - rect.height - 12);
			position.value = {
				left: `${Math.max(12, Math.min(left, maxX))}px`,
				top: `${Math.max(12, Math.min(top, maxY))}px`
			};
		}
		function clamp() {
			const rect = activeElement()?.getBoundingClientRect();
			if (rect) place(rect.left, rect.top);
		}
		function observeElements() {
			observer.disconnect();
			observer.observe(panel.value);
			if (launcher.value) observer.observe(launcher.value);
		}
		function startDrag(event) {
			if (event.button !== 0 || event.isPrimary === false || origin) return;
			const isLauncher = event.currentTarget === launcher.value;
			if (!isLauncher && event.target.closest("button, a, input")) return;
			const rect = activeElement().getBoundingClientRect();
			origin = {
				pointerId: event.pointerId,
				isLauncher,
				x: event.clientX,
				y: event.clientY,
				left: rect.left,
				top: rect.top
			};
			suppressLauncherClick = false;
			event.currentTarget.setPointerCapture(event.pointerId);
		}
		function moveDrag(event) {
			if (!origin || event.pointerId !== origin.pointerId) return;
			const dx = event.clientX - origin.x;
			const dy = event.clientY - origin.y;
			if (!dragging.value && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
			dragging.value = true;
			if (origin.isLauncher) suppressLauncherClick = true;
			place(origin.left + dx, origin.top + dy);
		}
		function endDrag(event) {
			if (!origin || event.pointerId !== origin.pointerId) return;
			origin = void 0;
			const moved = dragging.value;
			dragging.value = false;
			if (!moved) return;
			try {
				_GM_setValue(POSITION_KEY, {
					left: parseFloat(position.value.left),
					top: parseFloat(position.value.top)
				});
			} catch (error) {
				console.warn("满分助手：悬浮窗位置保存失败", error);
			}
		}
		function consumeDragClick(event) {
			const ignore = suppressLauncherClick && event.detail !== 0;
			suppressLauncherClick = false;
			return ignore;
		}
		(0, vue.onMounted)(() => {
			ownerWindow = panel.value.ownerDocument.defaultView;
			ownerWindow.addEventListener("resize", clamp);
			observer = new ownerWindow.ResizeObserver(clamp);
			observeElements();
			const panelWidth = parseFloat(ownerWindow.getComputedStyle(panel.value).width) || 356;
			place(saved?.left ?? ownerWindow.innerWidth - panelWidth - 20, saved?.top ?? 72);
		});
		(0, vue.watch)(visible, async () => {
			await (0, vue.nextTick)();
			if (!observer || !panel.value) return;
			observeElements();
			clamp();
		});
		(0, vue.onBeforeUnmount)(() => {
			observer?.disconnect();
			ownerWindow?.removeEventListener("resize", clamp);
			observer = void 0;
		});
		return {
			position,
			dragging,
			startDrag,
			moveDrag,
			endDrag,
			consumeDragClick
		};
	}
	var _hoisted_1$3 = ["width", "height"];
	var _hoisted_2$3 = ["d"];
	var _sfc_main$3 = {
		__name: "Icon",
		props: {
			name: String,
			size: {
				type: Number,
				default: 18
			}
		},
		setup(__props) {
			const paths = {
				settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M9 3l-1 3-3 1-2 3 2 2-1 4 3 2 3-1 3 3 3-1 1-3 3-1 1-3-2-2 1-4-3-2-3 1-2-2Z",
				close: "m6 6 12 12M6 18 18 6",
				minus: "M5 12h14",
				arrow: "m10 7 5 5-5 5",
				check: "m5 12 4 4L19 6",
				book: "M4 4h6l2 2 2-2h6v15h-6l-2 2-2-2H4ZM12 6v15",
				clock: "M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
				play: "m9 6 10 6-10 6ZM4 5v14",
				grip: "M8 6h.01M16 6h.01M8 12h.01M16 12h.01M8 18h.01M16 18h.01"
			};
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createElementBlock)("svg", {
					width: __props.size,
					height: __props.size,
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					"stroke-width": "1.7",
					"stroke-linecap": "round",
					"stroke-linejoin": "round",
					"aria-hidden": "true"
				}, [(0, vue.createElementVNode)("path", { d: paths[__props.name] || paths.book }, null, 8, _hoisted_2$3)], 8, _hoisted_1$3);
			};
		}
	};
	var _hoisted_1$2 = (0, vue.createElementVNode)("div", { class: "mf-section-intro" }, [(0, vue.createElementVNode)("h2", null, "授权码与设置"), (0, vue.createElementVNode)("p", null, "题库授权码在下方填写，修改后自动保存。")], -1);
	var _hoisted_2$2 = {
		class: "mf-segments",
		"aria-label": "配置分类"
	};
	var _hoisted_3$2 = ["aria-pressed", "onClick"];
	var _hoisted_4$2 = { class: "mf-field-label" };
	var _hoisted_5$2 = ["for"];
	var _hoisted_6$2 = ["id"];
	var _hoisted_7$2 = [
		"id",
		"onUpdate:modelValue",
		"aria-describedby"
	];
	var _hoisted_8$2 = [
		"id",
		"onUpdate:modelValue",
		"aria-describedby",
		"aria-invalid"
	];
	var _hoisted_9$2 = [
		"id",
		"onUpdate:modelValue",
		"type",
		"placeholder",
		"aria-describedby"
	];
	var _hoisted_10$2 = {
		key: 3,
		class: "mf-error",
		role: "alert"
	};
	var _sfc_main$2 = {
		__name: "SettingsPanel",
		setup(__props) {
			const formStore = useformStore();
			const { forminput, activeName } = (0, pinia.storeToRefs)(formStore);
			const draft = (0, vue.reactive)({ ...forminput.value });
			const errors = (0, vue.ref)({});
			const hasSaved = (0, vue.ref)(false);
			const saveFailed = (0, vue.ref)(false);
			const hasErrors = (0, vue.computed)(() => Object.keys(errors.value).length > 0);
			const saveStatus = (0, vue.computed)(() => {
				if (saveFailed.value) return "自动保存失败，请继续编辑重试";
				if (hasErrors.value) return "标红项未保存，其他有效修改会自动保存";
				return hasSaved.value ? "已自动保存，刷新页面生效" : "修改后自动保存，刷新页面生效";
			});
			const isToken = (field) => field.name.endsWith("token");
			const displayGroups = userConfig.map((group) => ({
				...group,
				label: group.name === "base" ? "授权码 / 基础" : group.label.replace("配置", ""),
				config: group.name === "base" ? [...group.config.filter(isToken), ...group.config.filter((field) => !isToken(field))] : group.config
			}));
			const fieldLabel = (field) => isToken(field) ? field.label.replace("秘钥", "授权码（秘钥）") : field.label;
			function onProviderChange(name) {
				var picked = null;
				for (var i = 0; i < AI_PROVIDERS.length; i++) {
					if (AI_PROVIDERS[i].name === name) { picked = AI_PROVIDERS[i]; break; }
				}
				if (!picked) return;
				draft.gptService = picked.name;
				draft.gptBaseURL = picked.baseURL;
				draft.gptModel = picked.model;
			}
			function autoSave() {
				const nextErrors = {};
				for (const [key, label] of [["interval", "间隔时间"], ["answerInterval", "答题间隔"]]) {
					const value = draft[key];
					if (value === "" || value == null) nextErrors[key] = `${label}不能为空`;
					else if (typeof value !== "number" || !Number.isFinite(value)) nextErrors[key] = `${label}必须为数字`;
					else if (value < 1) nextErrors[key] = `${label}必须大于等于1`;
				}
				errors.value = nextErrors;
				const nextConfig = {
					...forminput.value,
					...draft
				};
				for (const key of Object.keys(nextErrors)) nextConfig[key] = forminput.value[key];
				if (!Object.keys(nextConfig).some((key) => !Object.is(nextConfig[key], forminput.value[key]))) {
					saveFailed.value = false;
					return;
				}
				try {
					formStore.saveConfig(nextConfig);
					Object.assign(forminput.value, nextConfig);
					hasSaved.value = true;
					saveFailed.value = false;
				} catch {
					saveFailed.value = true;
				}
			}
			(0, vue.watch)(draft, autoSave, { flush: "sync" });
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createElementBlock)("form", {
					class: "mf-settings",
					onSubmit: _cache[0] || (_cache[0] = (0, vue.withModifiers)(() => {}, ["prevent"])),
					novalidate: ""
				}, [
					_hoisted_1$2,
					(0, vue.createElementVNode)("nav", _hoisted_2$2, [((0, vue.openBlock)(true), (0, vue.createElementBlock)(vue.Fragment, null, (0, vue.renderList)((0, vue.unref)(displayGroups), (group) => {
						return (0, vue.openBlock)(), (0, vue.createElementBlock)("button", {
							key: group.name,
							type: "button",
							class: (0, vue.normalizeClass)({ "is-active": (0, vue.unref)(activeName) === group.name }),
							"aria-pressed": (0, vue.unref)(activeName) === group.name,
							onClick: ($event) => activeName.value = group.name
						}, (0, vue.toDisplayString)(group.label), 11, _hoisted_3$2);
					}), 128))]),
					((0, vue.openBlock)(true), (0, vue.createElementBlock)(vue.Fragment, null, (0, vue.renderList)((0, vue.unref)(displayGroups), (group) => {
						return (0, vue.withDirectives)(((0, vue.openBlock)(), (0, vue.createElementBlock)("div", {
							key: group.name,
							class: (0, vue.normalizeClass)(["mf-fields", { "mf-fields-base": group.name === "base" }])
						}, [((0, vue.openBlock)(true), (0, vue.createElementBlock)(vue.Fragment, null, (0, vue.renderList)(group.config, (field) => {
							return (0, vue.openBlock)(), (0, vue.createElementBlock)("div", {
								key: field.name,
								class: (0, vue.normalizeClass)(["mf-field", {
									"mf-field-switch": field.type === "switch",
									"mf-field-token": isToken(field)
								}])
							}, [
								(0, vue.createElementVNode)("div", _hoisted_4$2, [(0, vue.createElementVNode)("label", { for: `mf-${field.name}` }, (0, vue.toDisplayString)(fieldLabel(field)), 9, _hoisted_5$2), (0, vue.createElementVNode)("p", { id: `mf-${field.name}-help` }, (0, vue.toDisplayString)(isToken(field) ? "选填 · 填写你获得的对应题库授权码" : field.desc), 9, _hoisted_6$2)]),
								field.type === "switch" ? (0, vue.withDirectives)(((0, vue.openBlock)(), (0, vue.createElementBlock)("input", {
									key: 0,
									id: `mf-${field.name}`,
									"onUpdate:modelValue": ($event) => draft[field.name] = $event,
									class: "mf-switch",
									type: "checkbox",
									role: "switch",
									"aria-describedby": `mf-${field.name}-help`
								}, null, 8, _hoisted_7$2)), [[vue.vModelCheckbox, draft[field.name]]]) : field.type === "select" ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("select", {key: "sel-" + field.name, id: `mf-${field.name}`, class: "mf-input mf-select", "aria-describedby": `mf-${field.name}-help`, onChange: ($event) => onProviderChange($event.target.value)}, [(0, vue.openBlock)(true), (0, vue.createElementBlock)(vue.Fragment, null, (0, vue.renderList)(AI_PROVIDERS, (p) => {return (0, vue.createElementVNode)("option", {key: p.name, value: p.name, selected: draft[field.name] === p.name}, (0, vue.toDisplayString)(p.name), 8, ["selected"]);}), 128)])) : field.type === "number" ? (0, vue.withDirectives)(((0, vue.openBlock)(), (0, vue.createElementBlock)("input", {
									key: 1,
									id: `mf-${field.name}`,
									"onUpdate:modelValue": ($event) => draft[field.name] = $event,
									class: "mf-input",
									type: "number",
									min: "1",
									step: "1",
									"aria-describedby": `mf-${field.name}-help`,
									"aria-invalid": !!errors.value[field.name]
								}, null, 8, _hoisted_8$2)), [[
									vue.vModelText,
									draft[field.name],
									void 0,
									{ number: true }
								]]) : (0, vue.withDirectives)(((0, vue.openBlock)(), (0, vue.createElementBlock)("input", {
									key: 2,
									id: `mf-${field.name}`,
									"onUpdate:modelValue": ($event) => draft[field.name] = $event,
									class: "mf-input",
									type: isToken(field) ? "password" : "text",
									placeholder: isToken(field) ? `粘贴${field.label.replace("秘钥", "")}授权码` : "",
									autocomplete: "off",
									"aria-describedby": `mf-${field.name}-help`
								}, null, 8, _hoisted_9$2)), [[vue.vModelDynamic, draft[field.name]]]),
								errors.value[field.name] ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("p", _hoisted_10$2, (0, vue.toDisplayString)(errors.value[field.name]), 1)) : (0, vue.createCommentVNode)("", true)
							], 2);
						}), 128))], 2)), [[vue.vShow, (0, vue.unref)(activeName) === group.name]]);
					}), 128)),
					(0, vue.createElementVNode)("footer", {
						class: (0, vue.normalizeClass)(["mf-autosave", {
							"is-error": hasErrors.value || saveFailed.value,
							"is-saved": hasSaved.value && !hasErrors.value && !saveFailed.value
						}]),
						role: "status"
					}, [(0, vue.createVNode)(_sfc_main$3, {
						name: hasSaved.value && !hasErrors.value && !saveFailed.value ? "check" : "clock",
						size: 14
					}, null, 8, ["name"]), (0, vue.createElementVNode)("span", null, (0, vue.toDisplayString)(saveStatus.value), 1)], 2)
				], 32);
			};
		}
	};
	var _hoisted_1$1 = { class: "mf-task" };
	var _hoisted_2$1 = { class: "mf-task-summary" };
	var _hoisted_3$1 = { class: "mf-task-icon" };
	var _hoisted_4$1 = (0, vue.createElementVNode)("span", { class: "mf-eyebrow" }, "当前任务", -1);
	var _hoisted_5$1 = (0, vue.createElementVNode)("i", null, null, -1);
	var _hoisted_6$1 = { class: "mf-progress-row" };
	var _hoisted_7$1 = ["aria-valuenow"];
	var _hoisted_8$1 = { class: "mf-question" };
	var _hoisted_9$1 = { class: "mf-question-heading" };
	var _hoisted_10$1 = { class: "mf-eyebrow" };
	var _hoisted_11$1 = { class: "mf-answer" };
	var _hoisted_12$1 = (0, vue.createElementVNode)("span", { class: "mf-eyebrow" }, "参考答案", -1);
	var _hoisted_13$1 = { key: 0 };
	var _hoisted_14$1 = {
		key: 1,
		class: "mf-loading"
	};
	var _hoisted_15$1 = (0, vue.createElementVNode)("span", null, null, -1);
	var _hoisted_16$1 = {
		key: 0,
		class: "mf-question-section",
		"aria-label": "题号导航"
	};
	var _hoisted_17$1 = (0, vue.createElementVNode)("div", { class: "mf-section-heading" }, [(0, vue.createElementVNode)("h3", null, "题号导航"), (0, vue.createElementVNode)("span", null, "点击定位到题目")], -1);
	var _hoisted_18$1 = { class: "mf-question-grid" };
	var _hoisted_19$1 = [
		"aria-label",
		"aria-current",
		"onClick"
	];
	var _hoisted_20 = {
		key: 1,
		class: "mf-sources"
	};
	var _hoisted_21 = { class: "mf-section-heading" };
	var _hoisted_22 = (0, vue.createElementVNode)("h3", null, "题库返回", -1);
	var _hoisted_23 = ["open"];
	var _hoisted_24$1 = ["innerHTML"];
	var _hoisted_25$1 = {
		key: 0,
		class: "mf-source-usage"
	};
	var _hoisted_26$1 = { class: "mf-help" };
	var _hoisted_27$1 = {
		key: 1,
		class: "mf-empty"
	};
	var _hoisted_28$1 = { class: "mf-empty-icon" };
	var _sfc_main$1 = {
		__name: "TaskPanel",
		emits: ["open-settings"],
		setup(__props, { emit }) {
			const store = useAskStore();
			const current = (0, vue.computed)(() => store.task.work.questionList[store.task.work.inx]);
			const answered = (0, vue.computed)(() => store.task.work.questionList.filter((item) => item.status === "primary").length);
			const completed = (0, vue.computed)(() => store.task.work.questionList.filter((item) => item.status).length);
			const percent = (0, vue.computed)(() => store.count ? Math.min(100, Math.round(completed.value / store.count * 100)) : 0);
			const answerText = (answer) => Array.isArray(answer) ? answer.join("\n") : String(answer || "");
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createElementBlock)("div", _hoisted_1$1, [(0, vue.createElementVNode)("div", _hoisted_2$1, [
					(0, vue.createElementVNode)("span", _hoisted_3$1, [(0, vue.createVNode)(_sfc_main$3, {
						name: (0, vue.unref)(store).task.video.status ? "play" : "book",
						size: 20
					}, null, 8, ["name"])]),
					(0, vue.createElementVNode)("div", null, [_hoisted_4$1, (0, vue.createElementVNode)("h2", null, (0, vue.toDisplayString)((0, vue.unref)(store).task.name === "暂未加载" ? "等待任务加载" : (0, vue.unref)(store).task.name), 1)]),
					(0, vue.createElementVNode)("span", { class: (0, vue.normalizeClass)(["mf-badge", { "is-waiting": (0, vue.unref)(store).task.name === "暂未加载" }]) }, [_hoisted_5$1, (0, vue.createTextVNode)((0, vue.toDisplayString)((0, vue.unref)(store).task.name === "暂未加载" ? "等待中" : "进行中"), 1)], 2)
				]), current.value ? ((0, vue.openBlock)(), (0, vue.createElementBlock)(vue.Fragment, { key: 0 }, [
					(0, vue.createElementVNode)("div", _hoisted_6$1, [(0, vue.createElementVNode)("span", null, "已处理 " + (0, vue.toDisplayString)(completed.value) + " / " + (0, vue.toDisplayString)((0, vue.unref)(store).count) + " 题", 1), (0, vue.createElementVNode)("span", null, "已匹配 " + (0, vue.toDisplayString)(answered.value) + " 题", 1)]),
					(0, vue.createElementVNode)("div", {
						class: "mf-progress",
						role: "progressbar",
						"aria-label": "题目处理进度",
						"aria-valuenow": percent.value,
						"aria-valuemin": "0",
						"aria-valuemax": "100"
					}, [(0, vue.createElementVNode)("span", { style: (0, vue.normalizeStyle)({ width: `${percent.value}%` }) }, null, 4)], 8, _hoisted_7$1),
					(0, vue.createElementVNode)("article", _hoisted_8$1, [
						(0, vue.createElementVNode)("div", _hoisted_9$1, [(0, vue.createElementVNode)("span", _hoisted_10$1, "第 " + (0, vue.toDisplayString)((0, vue.unref)(store).task.work.inx + 1) + " 题", 1), (0, vue.createElementVNode)("span", { class: (0, vue.normalizeClass)(["mf-answer-status", current.value.status]) }, (0, vue.toDisplayString)(current.value.status === "primary" ? "已匹配答案" : current.value.status === "danger" ? "暂无答案" : "正在检索"), 3)]),
						(0, vue.createElementVNode)("h3", null, (0, vue.toDisplayString)(current.value.question), 1),
						(0, vue.createElementVNode)("div", _hoisted_11$1, [_hoisted_12$1, current.value.answer ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("pre", _hoisted_13$1, (0, vue.toDisplayString)(answerText(current.value.answer)), 1)) : ((0, vue.openBlock)(), (0, vue.createElementBlock)("div", _hoisted_14$1, [_hoisted_15$1, (0, vue.createTextVNode)("正在检索题库，请稍候…")]))])
					]),
					(0, vue.unref)(store).task.name !== "考试" ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("section", _hoisted_16$1, [_hoisted_17$1, (0, vue.createElementVNode)("div", _hoisted_18$1, [((0, vue.openBlock)(true), (0, vue.createElementBlock)(vue.Fragment, null, (0, vue.renderList)((0, vue.unref)(store).task.work.questionList, (question, index) => {
						return (0, vue.openBlock)(), (0, vue.createElementBlock)("button", {
							key: index,
							type: "button",
							class: (0, vue.normalizeClass)([question.status, { "is-current": (0, vue.unref)(store).task.work.inx === index }]),
							"aria-label": `查看第 ${index + 1} 题`,
							"aria-current": (0, vue.unref)(store).task.work.inx === index ? "true" : void 0,
							onClick: ($event) => (0, vue.unref)(store).select(index)
						}, (0, vue.toDisplayString)(index + 1), 11, _hoisted_19$1);
					}), 128))])])) : (0, vue.createCommentVNode)("", true),
					current.value.allAnswer ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("section", _hoisted_20, [
						(0, vue.createElementVNode)("div", _hoisted_21, [_hoisted_22, (0, vue.createElementVNode)("button", {
							type: "button",
							class: "mf-auth-link",
							onClick: _cache[0] || (_cache[0] = ($event) => emit("open-settings"))
						}, [(0, vue.createTextVNode)(" 填写授权码"), (0, vue.createVNode)(_sfc_main$3, {
							name: "arrow",
							size: 12
						})])]),
						((0, vue.openBlock)(true), (0, vue.createElementBlock)(vue.Fragment, null, (0, vue.renderList)(current.value.allAnswer, (source, index) => {
							return (0, vue.openBlock)(), (0, vue.createElementBlock)("details", {
								key: index,
								open: index === 0
							}, [
								(0, vue.createElementVNode)("summary", null, [
									(0, vue.createTextVNode)((0, vue.toDisplayString)(source.form), 1),
									(0, vue.createElementVNode)("span", null, (0, vue.toDisplayString)(source.answer?.length ? "查看结果" : "暂无答案"), 1),
									(0, vue.createVNode)(_sfc_main$3, {
										name: "arrow",
										size: 14
									})
								]),
								(0, vue.createElementVNode)("div", {
									class: "mf-source-answer",
									innerHTML: answerText(source.answer) || "暂无答案"
								}, null, 8, _hoisted_24$1),
								source.num != null ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("div", _hoisted_25$1, [(0, vue.createElementVNode)("span", null, "已用 " + (0, vue.toDisplayString)(source.usenum), 1), (0, vue.createElementVNode)("span", null, "剩余 " + (0, vue.toDisplayString)(source.num), 1)])) : (0, vue.createCommentVNode)("", true)
							], 8, _hoisted_23);
						}), 128)),
						(0, vue.createElementVNode)("p", _hoisted_26$1, (0, vue.toDisplayString)(current.value.allAnswer.length) + " 个题库来源 · 授权码自动保存，刷新页面生效。 ", 1)
					])) : (0, vue.createCommentVNode)("", true)
				], 64)) : ((0, vue.openBlock)(), (0, vue.createElementBlock)("div", _hoisted_27$1, [
					(0, vue.createElementVNode)("div", _hoisted_28$1, [(0, vue.createVNode)(_sfc_main$3, {
						name: (0, vue.unref)(store).task.video.status ? "play" : "clock",
						size: 30
					}, null, 8, ["name"])]),
					(0, vue.createElementVNode)("h3", null, (0, vue.toDisplayString)((0, vue.unref)(store).task.video.status ? "正在完成视频任务" : "准备就绪，等待任务"), 1),
					(0, vue.createElementVNode)("p", null, (0, vue.toDisplayString)((0, vue.unref)(store).task.video.status ? "视频运行状态可在日志中查看。" : "进入章节、作业或考试页面后，任务进度会显示在这里。"), 1)
				]))]);
			};
		}
	};
	var _hoisted_1 = ["onKeydown"];
	var _hoisted_2 = { class: "mf-brand" };
	var _hoisted_3 = { class: "mf-brand-text" };
	var _hoisted_4 = (0, vue.createElementVNode)("h1", null, [(0, vue.createTextVNode)("满分助手"), (0, vue.createElementVNode)("span", null, "学习通")], -1);
	var _hoisted_5 = { class: "mf-window-actions" };
	var _hoisted_6 = ["aria-label", "title"];
	var _hoisted_7 = {
		key: 0,
		class: "mf-tabs",
		"aria-label": "助手内容"
	};
	var _hoisted_8 = ["aria-pressed", "onClick"];
	var _hoisted_9 = {
		key: 0,
		class: "mf-tab-count"
	};
	var _hoisted_10 = { class: "mf-body" };
	var _hoisted_11 = {
		key: 1,
		class: "mf-logs",
		"aria-label": "运行日志"
	};
	var _hoisted_12 = { class: "mf-section-heading" };
	var _hoisted_13 = (0, vue.createElementVNode)("h2", null, "运行记录", -1);
	var _hoisted_14 = {
		key: 0,
		class: "mf-empty"
	};
	var _hoisted_15 = (0, vue.createElementVNode)("h3", null, "还没有运行记录", -1);
	var _hoisted_16 = (0, vue.createElementVNode)("p", null, "任务开始后，日志会出现在这里。", -1);
	var _hoisted_17 = { key: 1 };
	var _hoisted_18 = (0, vue.createElementVNode)("span", { class: "mf-log-dot" }, null, -1);
	var _hoisted_19 = {
		key: 2,
		class: "mf-notice"
	};
	var _hoisted_24 = [
		(0, vue.createElementVNode)("span", { class: "mf-eyebrow" }, "使用公告", -1),
		(0, vue.createElementVNode)("h2", null, "本脚本仅用于学习交流，请24h内删除", -1),
		(0, vue.createElementVNode)("p", null, "禁止用于各种非法用途，否则后果自负。", -1),
		(0, vue.createElementVNode)("p", null, " 本脚本题库接口均来源于网络以及用户反馈添加，不对题库准确率以及可用性负责，请自行判断、评估是否使用。 ", -1)
	];
	var _hoisted_25 = { class: "mf-panel-footer" };
	var _hoisted_26 = { class: "mf-footer-status" };
	var _hoisted_27 = (0, vue.createElementVNode)("i", null, null, -1);
	var _hoisted_28 = (0, vue.createElementVNode)("span", { class: "mf-version" }, "v2.2.1 AI", -1);
	var _hoisted_29 = ["aria-label", "title"];
	var _hoisted_30 = { class: "mf-launcher-icon" };
	var _sfc_main = {
		__name: "App",
		props: { taskMode: Boolean },
		setup(__props) {
			const props = __props;
			const askStore = useAskStore();
			const { task, dialogVisible } = (0, pinia.storeToRefs)(askStore);
			const { dialogV, activeName } = (0, pinia.storeToRefs)(useformStore());
			const activeTab = (0, vue.ref)("task");
			const panel = (0, vue.ref)(null);
			const launcher = (0, vue.ref)(null);
			const visible = (0, vue.computed)(() => dialogV.value || props.taskMode && dialogVisible.value);
			const { position, dragging, startDrag, moveDrag, endDrag, consumeDragClick } = useFloatingPanel(panel, launcher, visible);
			const tabs = [
				{
					id: "task",
					label: "运行状态"
				},
				{
					id: "logs",
					label: "运行日志"
				},
				{
					id: "notice",
					label: "公告"
				}
			];
			function closePanel() {
				dialogV.value = false;
				dialogVisible.value = false;
			}
			function openPanel(event) {
				if (consumeDragClick(event)) {
					event.preventDefault();
					event.stopPropagation();
					return;
				}
				props.taskMode ? dialogVisible.value = true : openSettings();
			}
			function openSettings() {
				activeName.value = "base";
				dialogV.value = true;
			}
			function toggleSettings() {
				dialogV.value ? dialogV.value = false : openSettings();
			}
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createElementBlock)(vue.Fragment, null, [(0, vue.withDirectives)((0, vue.createElementVNode)("section", {
					ref_key: "panel",
					ref: panel,
					class: (0, vue.normalizeClass)(["mf-panel", { "is-dragging": (0, vue.unref)(dragging) }]),
					style: (0, vue.normalizeStyle)((0, vue.unref)(position)),
					"aria-label": "满分助手",
					onKeydown: (0, vue.withKeys)((0, vue.withModifiers)(closePanel, ["stop"]), ["esc"])
				}, [
					(0, vue.createElementVNode)("header", {
						class: "mf-header",
						onPointerdown: _cache[0] || (_cache[0] = (...args) => (0, vue.unref)(startDrag) && (0, vue.unref)(startDrag)(...args)),
						onPointermove: _cache[1] || (_cache[1] = (...args) => (0, vue.unref)(moveDrag) && (0, vue.unref)(moveDrag)(...args)),
						onPointerup: _cache[2] || (_cache[2] = (...args) => (0, vue.unref)(endDrag) && (0, vue.unref)(endDrag)(...args)),
						onPointercancel: _cache[3] || (_cache[3] = (...args) => (0, vue.unref)(endDrag) && (0, vue.unref)(endDrag)(...args)),
						onLostpointercapture: _cache[4] || (_cache[4] = (...args) => (0, vue.unref)(endDrag) && (0, vue.unref)(endDrag)(...args))
					}, [
						(0, vue.createElementVNode)("span", _hoisted_2, [(0, vue.createVNode)(_sfc_main$3, {
							name: "check",
							size: 22
						})]),
						(0, vue.createElementVNode)("div", _hoisted_3, [_hoisted_4, (0, vue.createElementVNode)("p", null, (0, vue.toDisplayString)((0, vue.unref)(dialogV) ? "授权码与学习偏好" : "学习进度，一目了然"), 1)]),
						(0, vue.createElementVNode)("div", _hoisted_5, [__props.taskMode ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("button", {
							key: 0,
							type: "button",
							class: (0, vue.normalizeClass)(["mf-settings-button", { "is-active": (0, vue.unref)(dialogV) }]),
							"aria-label": (0, vue.unref)(dialogV) ? "返回任务" : "设置 / 授权码",
							title: (0, vue.unref)(dialogV) ? "返回任务" : "设置 / 授权码",
							onClick: toggleSettings
						}, [(0, vue.createVNode)(_sfc_main$3, {
							name: (0, vue.unref)(dialogV) ? "book" : "settings",
							size: 14
						}, null, 8, ["name"]), (0, vue.createElementVNode)("span", null, (0, vue.toDisplayString)((0, vue.unref)(dialogV) ? "返回任务" : "设置 / 授权码"), 1)], 10, _hoisted_6)) : (0, vue.createCommentVNode)("", true), (0, vue.createElementVNode)("button", {
							type: "button",
							class: "mf-icon-button",
							"aria-label": "收起面板",
							title: "收起面板",
							onClick: closePanel
						}, [(0, vue.createVNode)(_sfc_main$3, { name: "minus" })])])
					], 32),
					!(0, vue.unref)(dialogV) && __props.taskMode ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("nav", _hoisted_7, [((0, vue.openBlock)(), (0, vue.createElementBlock)(vue.Fragment, null, (0, vue.renderList)(tabs, (tab) => {
						return (0, vue.createElementVNode)("button", {
							key: tab.id,
							type: "button",
							class: (0, vue.normalizeClass)({ "is-active": activeTab.value === tab.id }),
							"aria-pressed": activeTab.value === tab.id,
							onClick: ($event) => activeTab.value = tab.id
						}, [(0, vue.createTextVNode)((0, vue.toDisplayString)(tab.label), 1), tab.id === "logs" && (0, vue.unref)(task).log.length ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("span", _hoisted_9, (0, vue.toDisplayString)((0, vue.unref)(task).log.length), 1)) : (0, vue.createCommentVNode)("", true)], 10, _hoisted_8);
					}), 64))])) : (0, vue.createCommentVNode)("", true),
					(0, vue.createElementVNode)("div", _hoisted_10, [(0, vue.unref)(dialogV) ? ((0, vue.openBlock)(), (0, vue.createBlock)(_sfc_main$2, { key: 0 })) : __props.taskMode ? ((0, vue.openBlock)(), (0, vue.createElementBlock)(vue.Fragment, { key: 1 }, [activeTab.value === "task" ? ((0, vue.openBlock)(), (0, vue.createBlock)(_sfc_main$1, {
						key: 0,
						onOpenSettings: openSettings
					})) : activeTab.value === "logs" ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("section", _hoisted_11, [(0, vue.createElementVNode)("div", _hoisted_12, [_hoisted_13, (0, vue.createElementVNode)("span", null, (0, vue.toDisplayString)((0, vue.unref)(task).log.length) + " 条", 1)]), !(0, vue.unref)(task).log.length ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("div", _hoisted_14, [
						(0, vue.createVNode)(_sfc_main$3, {
							name: "clock",
							size: 28
						}),
						_hoisted_15,
						_hoisted_16
					])) : ((0, vue.openBlock)(), (0, vue.createElementBlock)("ol", _hoisted_17, [((0, vue.openBlock)(true), (0, vue.createElementBlock)(vue.Fragment, null, (0, vue.renderList)((0, vue.unref)(task).log, (entry, index) => {
						return (0, vue.openBlock)(), (0, vue.createElementBlock)("li", {
							key: index,
							class: (0, vue.normalizeClass)(entry.type)
						}, [_hoisted_18, (0, vue.createElementVNode)("div", null, [(0, vue.createElementVNode)("time", null, (0, vue.toDisplayString)(entry.time), 1), (0, vue.createElementVNode)("p", null, (0, vue.toDisplayString)(entry.msg), 1)])], 2);
					}), 128))]))])) : ((0, vue.openBlock)(), (0, vue.createElementBlock)("section", _hoisted_19, _hoisted_24))], 64)) : (0, vue.createCommentVNode)("", true)]),
					(0, vue.createElementVNode)("footer", _hoisted_25, [(0, vue.createElementVNode)("span", _hoisted_26, [_hoisted_27, (0, vue.createTextVNode)((0, vue.toDisplayString)(__props.taskMode && (0, vue.unref)(task).status ? (0, vue.unref)(task).status : "面板外可正常点击与滚动"), 1)]), _hoisted_28])
				], 46, _hoisted_1), [[vue.vShow, visible.value]]), !visible.value ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("button", {
					key: 0,
					ref_key: "launcher",
					ref: launcher,
					class: (0, vue.normalizeClass)(["mf-launcher", { "is-dragging": (0, vue.unref)(dragging) }]),
					style: (0, vue.normalizeStyle)((0, vue.unref)(position)),
					type: "button",
					"aria-label": __props.taskMode ? "展开满分助手" : "设置 / 授权码",
					title: __props.taskMode ? "拖动调整位置，点击展开" : "拖动调整位置，点击打开设置",
					onPointerdown: _cache[5] || (_cache[5] = (...args) => (0, vue.unref)(startDrag) && (0, vue.unref)(startDrag)(...args)),
					onPointermove: _cache[6] || (_cache[6] = (...args) => (0, vue.unref)(moveDrag) && (0, vue.unref)(moveDrag)(...args)),
					onPointerup: _cache[7] || (_cache[7] = (...args) => (0, vue.unref)(endDrag) && (0, vue.unref)(endDrag)(...args)),
					onPointercancel: _cache[8] || (_cache[8] = (...args) => (0, vue.unref)(endDrag) && (0, vue.unref)(endDrag)(...args)),
					onLostpointercapture: _cache[9] || (_cache[9] = (...args) => (0, vue.unref)(endDrag) && (0, vue.unref)(endDrag)(...args)),
					onClick: openPanel
				}, [
					(0, vue.createElementVNode)("span", _hoisted_30, [(0, vue.createVNode)(_sfc_main$3, {
						name: "check",
						size: 22
					})]),
					(0, vue.createElementVNode)("span", null, [(0, vue.createTextVNode)("满分助手"), (0, vue.createElementVNode)("small", null, (0, vue.toDisplayString)(__props.taskMode ? (0, vue.unref)(task).name !== "暂未加载" ? (0, vue.unref)(task).name : "点击展开" : "设置 / 授权码"), 1)]),
					(0, vue.createVNode)(_sfc_main$3, {
						name: "arrow",
						size: 16
					})
				], 46, _hoisted_29)) : (0, vue.createCommentVNode)("", true)], 64);
			};
		}
	};
	var CHANNEL = "manfen:ui-ownership:1";
	var HOSTS_CHANGED = "manfen:ui-hosts-changed";
	var roles = ["settings", "task"];
	var self = _unsafeWindow;
	var top = self.top;
	var instance = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
	var hosts = new Map();
	var waiting = new Map();
	var candidates = new Map();
	var initialized = false;
	var suspended = false;
	var fallbackReady = self === top;
	var selectedRole;
	var fallbackTimer;
	var sweepTimer;
	var sequence = 0;
	function send(target, message, origin = "*") {
		target.postMessage({
			channel: CHANNEL,
			...message
		}, origin === "null" ? "*" : origin);
	}
	function render() {
		for (const [role, { host }] of hosts) {
			const visible = selectedRole === void 0 ? fallbackReady && (role === "task" || !host.ownerDocument.getElementById("manfen-task-root")) : role === selectedRole;
			host.style.setProperty("display", visible ? "block" : "none", "important");
		}
	}
	function notifyOwner(owner) {
		owner.dispatchEvent(new owner.defaultView.Event(HOSTS_CHANGED));
	}
	function frameDepths(root = self, depth = 0, result = new Map()) {
		result.set(root, depth);
		for (let index = 0; index < root.length; index++) frameDepths(root.frames[index], depth + 1, result);
		return result;
	}
	function elect(depths = frameDepths()) {
		let winner;
		for (const [source, candidate] of candidates) {
			if (!depths.has(source)) {
				candidates.delete(source);
				continue;
			}
			for (const role of candidate.roles) {
				const rank = roles.indexOf(role);
				const depth = depths.get(source);
				if (!winner || rank > winner.rank || rank === winner.rank && (depth < winner.depth || depth === winner.depth && candidate.order < winner.order)) winner = {
					source,
					role,
					rank,
					depth,
					order: candidate.order
				};
			}
		}
		for (const [source, candidate] of candidates) {
			const role = source === winner?.source ? winner.role : null;
			if (candidate.selectedRole === role) continue;
			candidate.selectedRole = role;
			if (source === self) {
				selectedRole = role;
				render();
			} else send(source, {
				type: "selection",
				instance: candidate.instance,
				role
			}, candidate.origin);
		}
	}
	function register(source, message, origin) {
		const depths = frameDepths();
		if (!depths.has(source)) return;
		const previous = candidates.get(source);
		candidates.set(source, {
			instance: message.instance,
			roles: message.roles,
			origin,
			order: previous?.order ?? sequence++
		});
		elect(depths);
	}
	function publish() {
		if (suspended) return;
		const message = {
			type: "register",
			instance,
			roles: [...hosts].filter(([, { host }]) => host.isConnected).map(([role]) => role)
		};
		if (self === top) register(self, message);
		else send(top, message);
	}
	function announce() {
		for (const frame of frameDepths().keys()) if (frame !== self) send(frame, { type: "ready" });
	}
	function onMessage(event) {
		const message = event.data;
		if (suspended || message?.channel !== CHANNEL) return;
		if (self === top) {
			if (typeof message.instance !== "string" || message.instance.length > 100) return;
			if (message.type === "register" && Array.isArray(message.roles) && message.roles.length <= roles.length && message.roles.every((role) => roles.includes(role))) register(event.source, message, event.origin);
			else if (message.type === "unregister") {
				for (const [source, candidate] of candidates) if (candidate.instance === message.instance && (source === event.source || event.source === null && candidate.origin === event.origin)) {
					candidates.delete(source);
					elect();
					break;
				}
			}
		} else if (event.source === top) {
			if (message.type === "ready") publish();
			else if (message.type === "selection" && message.instance === instance && (message.role === null || roles.includes(message.role))) {
				selectedRole = message.role;
				clearTimeout(fallbackTimer);
				render();
			}
		}
	}
	function onPageHide(event) {
		suspended = true;
		clearTimeout(fallbackTimer);
		clearInterval(sweepTimer);
		if (self === top) candidates.clear();
		else send(top, {
			type: "unregister",
			instance
		});
		for (const { host, dispose } of hosts.values()) {
			host.remove();
			notifyOwner(host.ownerDocument);
			if (!event.persisted) {
				host.ownerDocument.removeEventListener(HOSTS_CHANGED, render);
				dispose();
			}
		}
		if (!event.persisted) {
			hosts.clear();
			for (const [retry, owner] of waiting) owner.removeEventListener(HOSTS_CHANGED, retry);
			waiting.clear();
		}
	}
	function resume() {
		suspended = false;
		selectedRole = void 0;
		fallbackReady = self === top;
		if (self === top) {
			sweepTimer = self.setInterval(() => elect(), 1e3);
			announce();
		} else fallbackTimer = self.setTimeout(() => {
			fallbackReady = true;
			render();
		}, 300);
		for (const retry of waiting.keys()) retry();
		render();
		publish();
	}
	function prepareUiOwnership() {
		if (initialized) return;
		initialized = true;
		self.addEventListener("message", onMessage);
		self.addEventListener("pagehide", onPageHide);
		self.addEventListener("pageshow", (event) => {
			if (!event.persisted) return;
			for (const entry of hosts.values()) {
				if (entry.waitingForRestore) continue;
				entry.waitingForRestore = true;
				const { host } = entry;
				const owner = host.ownerDocument;
				whenUiHostAvailable(owner, host.id, () => {
					entry.waitingForRestore = false;
					owner.body.append(host);
					notifyOwner(owner);
					publish();
				});
			}
			resume();
		});
		resume();
	}
	function whenUiHostAvailable(owner, id, attach) {
		const retry = () => {
			if (suspended || owner.getElementById(id)) return;
			waiting.delete(retry);
			owner.removeEventListener(HOSTS_CHANGED, retry);
			attach();
		};
		waiting.set(retry, owner);
		owner.addEventListener(HOSTS_CHANGED, retry);
		retry();
	}
	function registerUiHost(host, taskMode, dispose) {
		hosts.set(taskMode ? "task" : "settings", {
			host,
			dispose
		});
		host.ownerDocument.addEventListener(HOSTS_CHANGED, render);
		notifyOwner(host.ownerDocument);
		publish();
	}
	var panel_default = ":host{all:initial;--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light;--mf-accent:#16856c;--mf-accent-dark:#106850;--mf-ink:#213c35;--mf-muted:#738279;--mf-line:#e8eeeb;color:var(--mf-ink);text-align:left;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Microsoft YaHei,sans-serif;font-size:13px;font-weight:400;line-height:1.6}*,:before,:after{box-sizing:border-box}.mf-root{pointer-events:none}button,input{font:inherit}button{color:inherit;cursor:pointer}button,input,summary{-webkit-tap-highlight-color:transparent}button{background:0 0;border:0;margin:0}button:focus-visible{outline-offset:3px;outline:3px solid #93d6c4}input:focus-visible{outline-offset:3px;outline:3px solid #93d6c4}summary:focus-visible{outline-offset:3px;outline:3px solid #93d6c4}h1,h2,h3,p,pre{margin:0}svg{vertical-align:middle;flex-shrink:0}.mf-panel{width:min(356px,100vw - 24px);max-height:min(760px,100vh - 24px);pointer-events:auto;isolation:isolate;background:#fff;border:1px solid #d9e4def2;border-radius:16px;flex-direction:column;max-height:min(760px,100dvh - 24px);display:flex;position:fixed;overflow:hidden;box-shadow:0 16px 48px -14px #173e3230,0 3px 12px #173e320d}.mf-header{cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;background:linear-gradient(115deg,#f7fbf8,#fff 80%);flex-shrink:0;align-items:center;gap:9px;padding:15px 14px;display:flex}.is-dragging .mf-header{cursor:grabbing}.mf-brand{color:#fff;background:var(--mf-accent);border-radius:10px;flex-shrink:0;place-items:center;width:34px;height:34px;display:grid;box-shadow:0 3px 8px #16856c26}.mf-brand-text{flex:1;min-width:0}.mf-brand-text h1{letter-spacing:.3px;white-space:nowrap;align-items:center;gap:6px;font-size:15px;font-weight:700;display:flex}.mf-brand-text h1 span{color:#648375;border:1px solid #d8e7df;border-radius:4px;padding:0 5px;font-size:10px;font-weight:500}.mf-brand-text p{color:#6f8176;letter-spacing:.3px;text-overflow:ellipsis;white-space:nowrap;margin-top:2px;font-size:11px;overflow:hidden}.mf-window-actions{flex-shrink:0;align-items:center;gap:4px;display:flex}.mf-settings-button{min-height:30px;color:var(--mf-accent-dark);white-space:nowrap;background:#eaf6ef;border:1px solid #cce5d9;border-radius:8px;justify-content:center;align-items:center;gap:4px;padding:5px 7px;font-size:11px;font-weight:600;line-height:18px;transition:background .15s,border-color .15s;display:inline-flex}.mf-settings-button:hover,.mf-settings-button.is-active{background:#dcefe4;border-color:#add7c3}.mf-settings-button>svg{width:15px;height:15px}.mf-icon-button{color:#6e8277;border-radius:8px;place-items:center;width:28px;height:30px;transition:background .15s,color .15s;display:grid}.mf-icon-button:hover,.mf-icon-button.is-active{color:var(--mf-accent);background:#eaf5ef}.mf-tabs{border-bottom:1px solid var(--mf-line);flex-shrink:0;gap:22px;padding:0 16px;display:flex}.mf-tabs>button{color:#728078;white-space:nowrap;border-bottom:2px solid #0000;align-items:center;gap:5px;padding:9px 0 10px;font-size:12px;display:flex}.mf-tabs>button.is-active{border-bottom-color:var(--mf-accent);color:var(--mf-accent);font-weight:600}.mf-tab-count{font-variant-numeric:tabular-nums;background:#eff3f0;border-radius:5px;padding:0 5px;font-size:10px;line-height:16px}.mf-body{overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#cbdcd2 transparent;min-height:0;overflow-y:auto}.mf-task,.mf-logs,.mf-notice,.mf-settings{padding:16px}.mf-task-summary{align-items:center;gap:9px;display:flex}.mf-task-icon{color:var(--mf-accent);background:#eff6f1;border:1px solid #e6efe9;border-radius:10px;flex-shrink:0;place-items:center;width:40px;height:40px;display:grid}.mf-eyebrow{color:#72847a;letter-spacing:.8px;font-size:10px}.mf-task-summary h2{margin-top:1px;font-size:15px;font-weight:600}.mf-badge{color:var(--mf-accent);white-space:nowrap;background:#eef7f1;border-radius:20px;align-items:center;gap:5px;margin-left:auto;padding:3px 8px;font-size:10px;display:inline-flex}.mf-badge i,.mf-footer-status i{background:#48a681;border-radius:50%;flex-shrink:0;width:5px;height:5px}.mf-badge.is-waiting{color:#927e4c;background:#f8f4e9}.mf-badge.is-waiting i{background:#b49c5f}.mf-progress-row{color:#728078;justify-content:space-between;margin-top:16px;font-size:10px;display:flex}.mf-progress-row span:last-child{color:#5f8c78}.mf-progress{background:#edf3ee;border-radius:5px;height:5px;margin-top:6px;overflow:hidden}.mf-progress>span{border-radius:inherit;background:#399b7a;height:100%;transition:width .25s;display:block}.mf-question{border:1px solid #e3ebe5;border-radius:10px;margin-top:15px;padding:12px}.mf-question-heading{justify-content:space-between;align-items:center;gap:12px;display:flex}.mf-answer-status{color:#728078;font-size:10px}.mf-answer-status.primary{color:var(--mf-accent)}.mf-answer-status.danger{color:#c26b57}.mf-question h3{overflow-wrap:anywhere;margin-top:8px;font-size:13px;font-weight:500;line-height:1.75}.mf-answer{background:#f4f8f4;border-radius:7px;margin-top:11px;padding:9px 10px}.mf-answer pre{white-space:pre-wrap;overflow-wrap:anywhere;color:#39715b;margin-top:4px;font-family:inherit;font-size:12px}.mf-loading{color:#708274;align-items:center;gap:7px;margin-top:6px;font-size:11px;display:flex}.mf-loading>span{background:#91b69f;border-radius:50%;width:6px;height:6px}.mf-question-section,.mf-sources{margin-top:17px}.mf-section-heading{justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px;display:flex}.mf-section-heading h2,.mf-section-heading h3{font-size:12px;font-weight:600}.mf-section-heading>span{color:#748477;font-size:10px}.mf-auth-link{color:var(--mf-accent-dark);white-space:nowrap;background:#eef7f2;border-radius:5px;align-items:center;gap:4px;padding:3px 6px;font-size:11px;font-weight:500;line-height:18px;transition:background .15s;display:inline-flex}.mf-auth-link:hover{background:#dcefe4}.mf-question-grid{scrollbar-width:thin;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px;max-height:120px;padding:2px;display:grid;overflow-y:auto}.mf-question-grid>button{color:#75867b;background:#f4f6f4;border:1px solid #e9ede8;border-radius:6px;height:28px;font-size:11px}.mf-question-grid>button.primary{color:#41816a;background:#edf6ef;border-color:#d9eadf}.mf-question-grid>button.danger{color:#bf8057;background:#fcf1ea;border-color:#f0e0d0}.mf-question-grid>button.is-current{background:var(--mf-accent);border-color:var(--mf-accent);color:#fff}.mf-question-grid>button:hover{box-shadow:0 0 0 2px #16856c24}.mf-sources details{border:1px solid var(--mf-line);border-radius:8px;margin-top:6px;padding:0 10px;overflow:hidden}.mf-sources summary{cursor:pointer;align-items:center;gap:5px;padding:8px 0;font-size:11px;list-style:none;display:flex}.mf-sources summary::-webkit-details-marker{display:none}.mf-sources summary>span{color:#768479;margin-left:auto;font-size:10px}.mf-sources details[open] summary>svg{transform:rotate(90deg)}.mf-source-answer{border-top:1px solid var(--mf-line);color:#68796d;overflow-wrap:anywhere;white-space:pre-wrap;padding:10px 0;font-size:11px;line-height:1.8}.mf-source-answer img{max-width:100%;height:auto}.mf-source-answer a{color:var(--mf-accent)}.mf-source-usage{color:#708175;gap:12px;padding-bottom:8px;font-size:10px;display:flex}.mf-help{color:#738376;margin-top:9px;font-size:10px;line-height:1.7}.mf-empty{text-align:center;color:#819487;padding:28px 12px 24px}.mf-empty-icon{color:#9bb4a3;background:#f7faf6;border:1px dashed #d4e4d8;border-radius:20px;place-items:center;width:60px;height:60px;margin:0 auto 14px;display:grid}.mf-empty h3{color:#587564;margin:12px 0 8px;font-size:13px;font-weight:500}.mf-empty p{color:#768777;max-width:235px;margin:auto;font-size:11px;line-height:1.9}.mf-panel-footer{border-top:1px solid var(--mf-line);background:#fbfcfa;flex-shrink:0;align-items:center;gap:15px;padding:9px 14px;display:flex}.mf-footer-status{color:#738578;overflow-wrap:anywhere;align-items:center;gap:6px;font-size:10px;display:flex}.mf-footer-status i{background:#99b4a0}.mf-version{color:#839287;white-space:nowrap;margin-left:auto;font-size:10px}.mf-logs ol{margin:0;padding:0;list-style:none}.mf-logs li{gap:9px;padding:0 0 16px;display:flex;position:relative}.mf-logs li:not(:last-child):before{content:\"\";background:#e8ede6;width:1px;position:absolute;top:13px;bottom:0;left:3px}.mf-log-dot{background:#b6c4b5;border-radius:50%;flex-shrink:0;width:7px;height:7px;margin-top:7px}.mf-logs .success .mf-log-dot{background:#61a17d}.mf-logs .error .mf-log-dot,.mf-logs .danger .mf-log-dot{background:#d59c84}.mf-logs time{color:#7b8b7b;font-variant-numeric:tabular-nums;font-size:10px}.mf-logs li p{color:#617363;overflow-wrap:anywhere;margin-top:3px;font-size:12px}.mf-notice h2{margin:10px 0 18px;font-size:15px;line-height:1.8}.mf-notice p{color:#71826d;margin:10px 0;font-size:12px;line-height:2}.mf-section-intro h2{font-size:15px;font-weight:600}.mf-section-intro p{color:#72826d;margin-top:4px;font-size:11px}.mf-segments{background:#f2f5ef;border-radius:9px;gap:4px;margin-top:16px;padding:4px;display:flex}.mf-segments button{color:#6f8168;border-radius:6px;flex:1;padding:6px 3px;font-size:11px}.mf-segments button.is-active{color:var(--mf-accent);background:#fff;box-shadow:0 1px 4px #233e2210}.mf-fields{padding-top:5px}.mf-field{padding-top:12px}.mf-fields-base{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:12px;display:grid}.mf-fields-base .mf-field{min-width:0}.mf-fields-base .mf-field-token{grid-column:1/-1}.mf-field-token+.mf-field-token{margin-top:1px}.mf-field-label label{font-size:12px;font-weight:500;display:block}.mf-field-label p{color:#77866f;margin-top:3px;font-size:10px;line-height:1.6}.mf-input{color:#3b5136;background:#fff;border:1px solid #dfe7da;border-radius:7px;width:100%;min-width:0;height:34px;margin-top:7px;padding:6px 9px;font-size:12px;transition:border-color .15s}.mf-input::placeholder{color:#899680}.mf-input:focus{border-color:var(--mf-accent);outline:none;box-shadow:0 0 0 3px #16856c14}.mf-select{cursor:pointer;padding-left:8px}.mf-input[aria-invalid=true]{border-color:#c97660}.mf-field-switch{border-bottom:1px solid #eff2eb;justify-content:space-between;align-items:center;gap:16px;padding:13px 0;display:flex}.mf-switch{-webkit-appearance:none;appearance:none;cursor:pointer;background:#d9e1d5;border-radius:20px;flex-shrink:0;width:34px;height:20px;margin:0;transition:background .15s;position:relative}.mf-switch:after{content:\"\";background:#fff;border-radius:50%;width:14px;height:14px;transition:transform .15s;position:absolute;top:3px;left:3px;box-shadow:0 1px 3px #0002}.mf-switch:checked{background:var(--mf-accent)}.mf-switch:checked:after{transform:translate(14px)}.mf-error{color:#ba604d;margin-top:5px;font-size:11px}.mf-autosave{border-top:1px solid var(--mf-line);color:#6f8067;align-items:center;gap:7px;margin-top:18px;padding-top:14px;font-size:11px;display:flex}.mf-autosave.is-saved{color:var(--mf-accent)}.mf-autosave.is-error{color:#ba604d}.mf-launcher{cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;pointer-events:auto;text-align:left;background:#fff;border:1px solid #dce9df;border-radius:12px;align-items:center;gap:8px;width:max-content;max-width:calc(100vw - 24px);padding:9px 11px 9px 9px;font-size:12px;display:flex;position:fixed;box-shadow:0 5px 24px #153b2720}.mf-launcher.is-dragging{cursor:grabbing}.mf-launcher:hover{border-color:#b5d7c5;box-shadow:0 5px 26px #153b2730}.mf-launcher-icon{background:var(--mf-accent);color:#fff;border-radius:9px;place-items:center;width:32px;height:32px;display:grid}.mf-launcher small{color:#75876f;text-overflow:ellipsis;white-space:nowrap;margin-top:1px;font-size:10px;display:block;overflow:hidden}.mf-launcher>span:not(.mf-launcher-icon){min-width:0}.mf-launcher>svg{color:#81957a}@media (max-width:420px){.mf-task,.mf-settings,.mf-logs,.mf-notice{padding:14px}.mf-header{padding:14px 12px}.mf-tabs{gap:20px;padding:0 14px}.mf-question-grid{gap:5px}}@media (max-width:360px){.mf-header{gap:7px}.mf-brand-text h1 span{display:none}.mf-settings-button{padding-inline-start:6px;padding-inline-end:6px}}@media (prefers-reduced-motion:reduce){*,:before,:after{transition:none!important}}";
	var SETTINGS_HOST = "manfen-settings-root";
	var TASK_HOST = "manfen-task-root";
	function uiDocument() {
		try {
			return _unsafeWindow.top.document;
		} catch {
			return document;
		}
	}
	function mount(taskMode) {
		prepareUiOwnership();
		const pinia$1 = (0, pinia.createPinia)();
		const app = (0, vue.createApp)(_sfc_main, { taskMode }).use(pinia$1);
		const formStore = useformStore(pinia$1);
		const askStore = useAskStore(pinia$1);
		const owner = uiDocument();
		const id = taskMode ? TASK_HOST : SETTINGS_HOST;
		whenUiHostAvailable(owner, id, () => {
			const host = owner.createElement("div");
			host.id = id;
			host.style.cssText = "position:fixed!important;left:0!important;top:0!important;width:0!important;height:0!important;overflow:visible!important;pointer-events:none!important;z-index:2147483000!important;";
			const shadow = host.attachShadow({ mode: "open" });
			const style = owner.createElement("style");
			style.textContent = panel_default;
			const root = owner.createElement("div");
			root.className = "mf-root";
			shadow.append(style, root);
			owner.body.append(host);
			app.mount(root);
			registerUiHost(host, taskMode, () => app.unmount());
		});
		return {
			app,
			formStore,
			askStore
		};
	}
	var mountSettingsApp = () => mount(false);
	var mountTaskApp = () => mount(true);
	function allowCopy() {
		(() => {
			document.body.oncopy = null, document.body.oncut = null, document.body.onpaste = null, document.body.onselectstart = null, document.body.ondragstart = null;
			const style = document.createElement("style");
			style.innerHTML = "\n       * {\n           -webkit-user-select: auto !important;\n           -moz-user-select: auto !important;\n           -o-user-select: auto !important;\n           user-select: auto !important;\n       }\n   ", document.head.appendChild(style);
		})();
	}
	var __defProp = Object.defineProperty;
	var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
		enumerable: true,
		configurable: true,
		writable: true,
		value
	}) : obj[key] = value;
	var __publicField = (obj, key, value) => {
		__defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
		return value;
	};
	var questionType = {
		"单选题": "0",
		"多选题": "1",
		"填空题": "2",
		"判断题": "3",
		"简答题": "4",
		"名词解释": "5",
		"论述题": "6",
		"计算题": "7"
	};
	var removeHtml = (html) => null == html ? "" : html.replace(/<((?!img|sub|sup|br)[^>]+)>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").replace(/<br\s*\/?>/g, "\n").replace(/<img.*?src="(.*?)".*?>/g, "<img src=\"$1\"/>").trim();
	var cl = (str) => str.replace(/^【.*?】\s*/, "").replace(/\s*（\d+\.\d+分）$/, "");
	var defaultConfig = getConfig();
	var ServerApi = class {
		constructor(window2 = _unsafeWindow) {
			__publicField(this, "api1", "http://api.tikuhai.com");
			__publicField(this, "api2", "http://cx.icodef.com/wyn-nb?v=4");
			__publicField(this, "api3", "https://tk.enncy.cn/query");
			__publicField(this, "api4", "https://api.muketool.com/cx/v2/query");
			__publicField(this, "windowz", _unsafeWindow);
			this.windowz = window2;
		}
		async defaultRequest(url, method, data = {}, headers = {}, type = false) {
			var _a;
			return type && (headers = {
				"Content-Type": "POST" == method ? "application/json" : "text/plain",
				Referer: this.windowz.location.href,
				v: _GM_info.script.version,
				key: defaultConfig.thtoken || "",
				uid: _unsafeWindow.uid || ((_a = _unsafeWindow == null ? void 0 : _unsafeWindow.getCookie) == null ? void 0 : _a.call(_unsafeWindow, "_uid")) || "",
				...headers
			}), new Promise((resolve, reject) => {
				_GM_xmlhttpRequest({
					method,
					url,
					data: JSON.stringify(data),
					headers,
					timeout: 1e4,
					onload: (res) => {
						resolve(res);
					},
					ontimeout: () => {
						reject("timeout");
					},
					onerror: (err) => {
						reject(err);
					}
				});
			});
		}
		async getAnswer(questionData) {
			return defaultConfig = getConfig(), new Promise((resolve) => {
				questionData = {
					key: defaultConfig.thtoken || "",
					...questionData
				}, this.defaultRequest(`${this.api1}/search`, "POST", questionData, {}, true).then((res) => {
					const data = JSON.parse(res.responseText);
					-1 === data.code && (this.s2(data.data), resolve({
						form: "题库海",
						answer: data.msg || ""
					})), resolve({
						form: "题库海",
						answer: data.data.answer || data.msg || "",
						num: data.data.num || "",
						usenum: data.data.usenum || ""
					});
				}).catch((e) => {
					resolve({
						form: "题库海",
						answer: ""
					});
				});
			});
		}
		async getAnswer2(questionData) {
			let ip = Array.from({ length: 4 }, () => Math.floor(255 * Math.random())).join(".");
			return new Promise((resolve) => {
				let ques = { question: questionData.question };
				this.defaultRequest(this.api2, "POST", ques, {
					"Content-Type": "application/json",
					Authorization: defaultConfig.yztoken,
					"X-Forwarded-For": ip,
					"X-Real-IP": ip
				}).then((response) => {
					const res = JSON.parse(response.responseText);
					let answer = "";
					if (1 === res.code) {
						let data = res.data.replace(/javascript:void\(0\);/g, "").trim().replace(/\n/g, "");
						data.includes("叛逆") || data.includes("公众号") || data.includes("李恒雅") || data.includes("一之") || (answer = data.split("#"));
					}
					resolve({
						form: "一之题库",
						answer
					});
				}).catch(() => {
					resolve({
						form: "一之题库",
						answer: ""
					});
				});
			});
		}
		async getAnswer3(questionData) {
			return new Promise((resolve) => {
				const ques = {
					token: defaultConfig.enncytoken,
					title: questionData.question
				};
				this.defaultRequest(this.api3, "POST", ques).then((response) => {
					const res = JSON.parse(response.responseText);
					resolve({
						form: "言溪题库",
						answer: 1 === res.code ? res.data.answer : ""
					});
				}).catch(() => {
					resolve({
						form: "言溪题库",
						answer: ""
					});
				});
			});
		}
		async getAnswer4(questionData) {
			return new Promise((resolve) => {
				const ques = {
					question: questionData.question,
					type: parseInt(questionData.type)
				};
				this.defaultRequest(this.api4, "POST", ques, { "Content-Type": "application/json" }).then((response) => {
					const res = JSON.parse(response.responseText);
					resolve({
						form: "free4",
						answer: 1 === res.code ? res.data.split("#") : ""
					});
				}).catch(() => {
					resolve({
						form: "free4",
						answer: ""
					});
				});
			});
		}
		async s(questionList, url) {
			return new Promise(async (resolve) => {
				const ques = {
					questionList,
					url
				};
				await this.defaultRequest(`${this.api1}/save1`, "POST", ques, { "Content-Type": "application/json" }).then((response) => {
					resolve();
				}).catch((e) => {
					resolve();
				});
			});
		}
		async s2(data) {
			data.url && this.defaultRequest(data.url, "GET", null, {}).then(async (response) => {
				const html = response.responseText;
				let document1, questionList, questionListHtml;
				document1 = new DOMParser().parseFromString(html, "text/html"), questionList = document1.getElementsByClassName("Py-mian1"), questionListHtml = [];
				for (let i = 0; i < questionList.length; i++) try {
					if (0 === i) continue;
					let questionTitle = removeHtml(questionList[i].getElementsByClassName("Py-m1-title")[0].innerHTML), questionType$1 = questionTitle.match(/\[(.*?)\]/)[1];
					if ("单选题" === questionType$1 || "多选题" === questionType$1) {
						questionTitle = questionTitle.replace(/[0-9]{1,3}.\s/gi, "").replace(/(^\s*)|(\s*$)/g, "").replace(/^【.*?】\s*/, "").replace(/\[(.*?)\]\s*/, "").replace(/\s*（\d+\.\d+分）$/, "");
						let optionHtml = (0, jquery.default)(questionList[i]).find("ul.answerList li.clearfix"), optionText = [];
						optionHtml.each(function(index, item) {
							let abcd = String.fromCharCode(65 + index) + ".", optionTemp = removeHtml(item.innerHTML);
							0 == optionTemp.indexOf(abcd) && (optionTemp = optionTemp.replace(abcd, "").trim()), optionText.push(optionTemp);
						}), questionListHtml.push({
							question: questionTitle,
							type: questionType[questionType$1],
							options: optionText,
							questionData: questionList[i].innerHTML
						});
					}
				} catch (e) {
					continue;
				}
				let postData = {
					questionList: questionListHtml,
					url: data.url
				};
				await this.defaultRequest(data.url1, "POST", postData, {}, true).then().catch();
			}).catch();
		}
	};
	var getQuestion = (type, html) => {
		let questionHtml, questionText, questionTypeId, optionHtml, tokenHtml, workType, optionText, index;
		switch (type) {
			case "1": return workType = "zj", questionHtml = Array.from(html.querySelectorAll(".clearfix .fontLabel")), questionText = cl(removeHtml(questionHtml[0].innerHTML)), questionTypeId = html.querySelectorAll("input[name^=answertype]")[0].value, optionHtml = Array.from(html.querySelectorAll("ul")[0].querySelectorAll("li .after")), tokenHtml = html.innerHTML, optionText = [], optionHtml.forEach(function(item) {
				optionText.push(removeHtml(item.innerHTML));
			}), {
				question: questionText,
				options: optionText,
				type: questionTypeId,
				questionData: tokenHtml,
				workType
			};
			case "2":
				workType = "zy", questionHtml = Array.from(html.querySelectorAll(".mark_name")), index = questionHtml[0].innerHTML.indexOf("</span>"), questionText = cl(removeHtml(questionHtml[0].innerHTML.substring(index + 7))), questionHtml[0].getElementsByTagName("span")[0].innerHTML.replace("(", "").replace(")", "").split(",")[0], questionTypeId = html.querySelectorAll("input[name^=answertype]")[0].value, optionHtml = Array.from(html.querySelectorAll(".answer_p")), tokenHtml = html.innerHTML, optionText = [];
				for (let i = 0; i < optionHtml.length; i++) optionText.push(removeHtml(optionHtml[i].innerHTML));
				return {
					question: questionText,
					options: optionText,
					type: questionTypeId,
					questionData: tokenHtml,
					workType
				};
			case "3":
				workType = "ks", questionHtml = Array.from(document.getElementsByClassName("mark_name colorDeep")), index = questionHtml[0].innerHTML.indexOf("</span>"), questionText = cl(removeHtml(questionHtml[0].innerHTML.substring(index + 7))), questionHtml[0].getElementsByTagName("span")[0].innerHTML.replace("(", "").replace(")", "").split(",")[0], questionTypeId = document.querySelectorAll("input[name^=type]")[1].value, optionHtml = Array.from(document.getElementsByClassName("answer_p")), tokenHtml = document.getElementsByClassName("mark_table")[0].innerHTML, optionText = [];
				for (let i = 0; i < optionHtml.length; i++) optionText.push(removeHtml(optionHtml[i].innerHTML));
				return {
					question: questionText,
					options: optionText,
					type: questionTypeId,
					questionData: tokenHtml,
					workType
				};
		}
	};
	function getDefaultExportFromCjs(x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x.default : x;
	}
	var Typr = {
		parse: function(buff) {
			var bin = Typr._bin, data = new Uint8Array(buff), offset = 0;
			bin.readFixed(data, offset), offset += 4;
			var numTables = bin.readUshort(data, offset);
			offset += 2, bin.readUshort(data, offset), offset += 2, bin.readUshort(data, offset), offset += 2, bin.readUshort(data, offset), offset += 2;
			for (var tags = [
				"cmap",
				"head",
				"hhea",
				"maxp",
				"hmtx",
				"name",
				"OS/2",
				"post",
				"loca",
				"glyf",
				"kern",
				"CFF ",
				"GPOS",
				"GSUB",
				"SVG "
			], obj = { _data: data }, tabs = {}, i = 0; i < numTables; i++) {
				var tag = bin.readASCII(data, offset, 4);
				offset += 4, bin.readUint(data, offset), offset += 4;
				var toffset = bin.readUint(data, offset);
				offset += 4;
				var length = bin.readUint(data, offset);
				offset += 4, tabs[tag] = {
					offset: toffset,
					length
				};
			}
			for (i = 0; i < tags.length; i++) {
				var t = tags[i];
				tabs[t] && (obj[t.trim()] = Typr[t.trim()].parse(data, tabs[t].offset, tabs[t].length, obj));
			}
			return obj;
		},
		_tabOffset: function(data, tab) {
			for (var bin = Typr._bin, numTables = bin.readUshort(data, 4), offset = 12, i = 0; i < numTables; i++) {
				var tag = bin.readASCII(data, offset, 4);
				offset += 4, bin.readUint(data, offset), offset += 4;
				var toffset = bin.readUint(data, offset);
				if (offset += 4, bin.readUint(data, offset), offset += 4, tag == tab) return toffset;
			}
			return 0;
		}
	};
	Typr._bin = {
		readFixed: function(data, o) {
			return (data[o] << 8 | data[o + 1]) + (data[o + 2] << 8 | data[o + 3]) / 65540;
		},
		readF2dot14: function(data, o) {
			return Typr._bin.readShort(data, o) / 16384;
		},
		readInt: function(buff, p) {
			var a = Typr._bin.t.uint8;
			return a[0] = buff[p + 3], a[1] = buff[p + 2], a[2] = buff[p + 1], a[3] = buff[p], Typr._bin.t.int32[0];
		},
		readInt8: function(buff, p) {
			return Typr._bin.t.uint8[0] = buff[p], Typr._bin.t.int8[0];
		},
		readShort: function(buff, p) {
			var a = Typr._bin.t.uint8;
			return a[1] = buff[p], a[0] = buff[p + 1], Typr._bin.t.int16[0];
		},
		readUshort: function(buff, p) {
			return buff[p] << 8 | buff[p + 1];
		},
		readUshorts: function(buff, p, len) {
			for (var arr = [], i = 0; i < len; i++) arr.push(Typr._bin.readUshort(buff, p + 2 * i));
			return arr;
		},
		readUint: function(buff, p) {
			var a = Typr._bin.t.uint8;
			return a[3] = buff[p], a[2] = buff[p + 1], a[1] = buff[p + 2], a[0] = buff[p + 3], Typr._bin.t.uint32[0];
		},
		readUint64: function(buff, p) {
			return 4294967296 * Typr._bin.readUint(buff, p) + Typr._bin.readUint(buff, p + 4);
		},
		readASCII: function(buff, p, l) {
			for (var s = "", i = 0; i < l; i++) s += String.fromCharCode(buff[p + i]);
			return s;
		},
		readUnicode: function(buff, p, l) {
			for (var s = "", i = 0; i < l; i++) {
				var c = buff[p++] << 8 | buff[p++];
				s += String.fromCharCode(c);
			}
			return s;
		},
		_tdec: window.TextDecoder ? new window.TextDecoder() : null,
		readUTF8: function(buff, p, l) {
			var tdec = Typr._bin._tdec;
			return tdec && 0 == p && l == buff.length ? tdec.decode(buff) : Typr._bin.readASCII(buff, p, l);
		},
		readBytes: function(buff, p, l) {
			for (var arr = [], i = 0; i < l; i++) arr.push(buff[p + i]);
			return arr;
		},
		readASCIIArray: function(buff, p, l) {
			for (var s = [], i = 0; i < l; i++) s.push(String.fromCharCode(buff[p + i]));
			return s;
		}
	}, Typr._bin.t = { buff: new ArrayBuffer(8) }, Typr._bin.t.int8 = new Int8Array(Typr._bin.t.buff), Typr._bin.t.uint8 = new Uint8Array(Typr._bin.t.buff), Typr._bin.t.int16 = new Int16Array(Typr._bin.t.buff), Typr._bin.t.uint16 = new Uint16Array(Typr._bin.t.buff), Typr._bin.t.int32 = new Int32Array(Typr._bin.t.buff), Typr._bin.t.uint32 = new Uint32Array(Typr._bin.t.buff), Typr._lctf = {}, Typr._lctf.parse = function(data, offset, length, font, subt) {
		var bin = Typr._bin, obj = {}, offset0 = offset;
		bin.readFixed(data, offset), offset += 4;
		var offScriptList = bin.readUshort(data, offset);
		offset += 2;
		var offFeatureList = bin.readUshort(data, offset);
		offset += 2;
		var offLookupList = bin.readUshort(data, offset);
		return offset += 2, obj.scriptList = Typr._lctf.readScriptList(data, offset0 + offScriptList), obj.featureList = Typr._lctf.readFeatureList(data, offset0 + offFeatureList), obj.lookupList = Typr._lctf.readLookupList(data, offset0 + offLookupList, subt), obj;
	}, Typr._lctf.readLookupList = function(data, offset, subt) {
		var bin = Typr._bin, offset0 = offset, obj = [], count = bin.readUshort(data, offset);
		offset += 2;
		for (var i = 0; i < count; i++) {
			var noff = bin.readUshort(data, offset);
			offset += 2;
			var lut = Typr._lctf.readLookupTable(data, offset0 + noff, subt);
			obj.push(lut);
		}
		return obj;
	}, Typr._lctf.readLookupTable = function(data, offset, subt) {
		var bin = Typr._bin, offset0 = offset, obj = { tabs: [] };
		obj.ltype = bin.readUshort(data, offset), offset += 2, obj.flag = bin.readUshort(data, offset), offset += 2;
		var cnt = bin.readUshort(data, offset);
		offset += 2;
		for (var i = 0; i < cnt; i++) {
			var noff = bin.readUshort(data, offset);
			offset += 2;
			var tab = subt(data, obj.ltype, offset0 + noff);
			obj.tabs.push(tab);
		}
		return obj;
	}, Typr._lctf.numOfOnes = function(n) {
		for (var num = 0, i = 0; i < 32; i++) 0 != (n >>> i & 1) && num++;
		return num;
	}, Typr._lctf.readClassDef = function(data, offset) {
		var bin = Typr._bin, obj = [], format = bin.readUshort(data, offset);
		if (offset += 2, 1 == format) {
			var startGlyph = bin.readUshort(data, offset);
			offset += 2;
			var glyphCount = bin.readUshort(data, offset);
			offset += 2;
			for (var i = 0; i < glyphCount; i++) obj.push(startGlyph + i), obj.push(startGlyph + i), obj.push(bin.readUshort(data, offset)), offset += 2;
		}
		if (2 == format) {
			var count = bin.readUshort(data, offset);
			offset += 2;
			for (i = 0; i < count; i++) obj.push(bin.readUshort(data, offset)), offset += 2, obj.push(bin.readUshort(data, offset)), offset += 2, obj.push(bin.readUshort(data, offset)), offset += 2;
		}
		return obj;
	}, Typr._lctf.getInterval = function(tab, val) {
		for (var i = 0; i < tab.length; i += 3) {
			var start = tab[i], end = tab[i + 1];
			if (tab[i + 2], start <= val && val <= end) return i;
		}
		return -1;
	}, Typr._lctf.readValueRecord = function(data, offset, valFmt) {
		var bin = Typr._bin, arr = [];
		return arr.push(1 & valFmt ? bin.readShort(data, offset) : 0), offset += 1 & valFmt ? 2 : 0, arr.push(2 & valFmt ? bin.readShort(data, offset) : 0), offset += 2 & valFmt ? 2 : 0, arr.push(4 & valFmt ? bin.readShort(data, offset) : 0), offset += 4 & valFmt ? 2 : 0, arr.push(8 & valFmt ? bin.readShort(data, offset) : 0), offset += 8 & valFmt ? 2 : 0, arr;
	}, Typr._lctf.readCoverage = function(data, offset) {
		var bin = Typr._bin, cvg = {};
		cvg.fmt = bin.readUshort(data, offset), offset += 2;
		var count = bin.readUshort(data, offset);
		return offset += 2, 1 == cvg.fmt && (cvg.tab = bin.readUshorts(data, offset, count)), 2 == cvg.fmt && (cvg.tab = bin.readUshorts(data, offset, 3 * count)), cvg;
	}, Typr._lctf.coverageIndex = function(cvg, val) {
		var tab = cvg.tab;
		if (1 == cvg.fmt) return tab.indexOf(val);
		if (2 == cvg.fmt) {
			var ind = Typr._lctf.getInterval(tab, val);
			if (-1 != ind) return tab[ind + 2] + (val - tab[ind]);
		}
		return -1;
	}, Typr._lctf.readFeatureList = function(data, offset) {
		var bin = Typr._bin, offset0 = offset, obj = [], count = bin.readUshort(data, offset);
		offset += 2;
		for (var i = 0; i < count; i++) {
			var tag = bin.readASCII(data, offset, 4);
			offset += 4;
			var noff = bin.readUshort(data, offset);
			offset += 2, obj.push({
				tag: tag.trim(),
				tab: Typr._lctf.readFeatureTable(data, offset0 + noff)
			});
		}
		return obj;
	}, Typr._lctf.readFeatureTable = function(data, offset) {
		var bin = Typr._bin;
		bin.readUshort(data, offset), offset += 2;
		var lookupCount = bin.readUshort(data, offset);
		offset += 2;
		for (var indices = [], i = 0; i < lookupCount; i++) indices.push(bin.readUshort(data, offset + 2 * i));
		return indices;
	}, Typr._lctf.readScriptList = function(data, offset) {
		var bin = Typr._bin, offset0 = offset, obj = {}, count = bin.readUshort(data, offset);
		offset += 2;
		for (var i = 0; i < count; i++) {
			var tag = bin.readASCII(data, offset, 4);
			offset += 4;
			var noff = bin.readUshort(data, offset);
			offset += 2, obj[tag.trim()] = Typr._lctf.readScriptTable(data, offset0 + noff);
		}
		return obj;
	}, Typr._lctf.readScriptTable = function(data, offset) {
		var bin = Typr._bin, offset0 = offset, obj = {}, defLangSysOff = bin.readUshort(data, offset);
		offset += 2, obj.default = Typr._lctf.readLangSysTable(data, offset0 + defLangSysOff);
		var langSysCount = bin.readUshort(data, offset);
		offset += 2;
		for (var i = 0; i < langSysCount; i++) {
			var tag = bin.readASCII(data, offset, 4);
			offset += 4;
			var langSysOff = bin.readUshort(data, offset);
			offset += 2, obj[tag.trim()] = Typr._lctf.readLangSysTable(data, offset0 + langSysOff);
		}
		return obj;
	}, Typr._lctf.readLangSysTable = function(data, offset) {
		var bin = Typr._bin, obj = {};
		bin.readUshort(data, offset), offset += 2, obj.reqFeature = bin.readUshort(data, offset), offset += 2;
		var featureCount = bin.readUshort(data, offset);
		return offset += 2, obj.features = bin.readUshorts(data, offset, featureCount), obj;
	}, Typr.CFF = {}, Typr.CFF.parse = function(data, offset, length) {
		var bin = Typr._bin;
		(data = new Uint8Array(data.buffer, offset, length))[offset = 0], data[++offset], data[++offset], data[++offset], offset++;
		var ninds = [];
		offset = Typr.CFF.readIndex(data, offset, ninds);
		for (var names = [], i = 0; i < ninds.length - 1; i++) names.push(bin.readASCII(data, offset + ninds[i], ninds[i + 1] - ninds[i]));
		offset += ninds[ninds.length - 1];
		var tdinds = [];
		offset = Typr.CFF.readIndex(data, offset, tdinds);
		var topDicts = [];
		for (i = 0; i < tdinds.length - 1; i++) topDicts.push(Typr.CFF.readDict(data, offset + tdinds[i], offset + tdinds[i + 1]));
		offset += tdinds[tdinds.length - 1];
		var topdict = topDicts[0], sinds = [];
		offset = Typr.CFF.readIndex(data, offset, sinds);
		var strings = [];
		for (i = 0; i < sinds.length - 1; i++) strings.push(bin.readASCII(data, offset + sinds[i], sinds[i + 1] - sinds[i]));
		if (offset += sinds[sinds.length - 1], Typr.CFF.readSubrs(data, offset, topdict), topdict.CharStrings) {
			offset = topdict.CharStrings;
			sinds = [];
			offset = Typr.CFF.readIndex(data, offset, sinds);
			var cstr = [];
			for (i = 0; i < sinds.length - 1; i++) cstr.push(bin.readBytes(data, offset + sinds[i], sinds[i + 1] - sinds[i]));
			topdict.CharStrings = cstr;
		}
		topdict.Encoding && (topdict.Encoding = Typr.CFF.readEncoding(data, topdict.Encoding, topdict.CharStrings.length)), topdict.charset && (topdict.charset = Typr.CFF.readCharset(data, topdict.charset, topdict.CharStrings.length)), topdict.Private && (offset = topdict.Private[1], topdict.Private = Typr.CFF.readDict(data, offset, offset + topdict.Private[0]), topdict.Private.Subrs && Typr.CFF.readSubrs(data, offset + topdict.Private.Subrs, topdict.Private));
		var obj = {};
		for (var p in topdict) -1 != [
			"FamilyName",
			"FullName",
			"Notice",
			"version",
			"Copyright"
		].indexOf(p) ? obj[p] = strings[topdict[p] - 426 + 35] : obj[p] = topdict[p];
		return obj;
	}, Typr.CFF.readSubrs = function(data, offset, obj) {
		var bin = Typr._bin, gsubinds = [];
		offset = Typr.CFF.readIndex(data, offset, gsubinds);
		var bias, nSubrs = gsubinds.length;
		bias = nSubrs < 1240 ? 107 : nSubrs < 33900 ? 1131 : 32768, obj.Bias = bias, obj.Subrs = [];
		for (var i = 0; i < gsubinds.length - 1; i++) obj.Subrs.push(bin.readBytes(data, offset + gsubinds[i], gsubinds[i + 1] - gsubinds[i]));
	}, Typr.CFF.tableSE = [
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10,
		11,
		12,
		13,
		14,
		15,
		16,
		17,
		18,
		19,
		20,
		21,
		22,
		23,
		24,
		25,
		26,
		27,
		28,
		29,
		30,
		31,
		32,
		33,
		34,
		35,
		36,
		37,
		38,
		39,
		40,
		41,
		42,
		43,
		44,
		45,
		46,
		47,
		48,
		49,
		50,
		51,
		52,
		53,
		54,
		55,
		56,
		57,
		58,
		59,
		60,
		61,
		62,
		63,
		64,
		65,
		66,
		67,
		68,
		69,
		70,
		71,
		72,
		73,
		74,
		75,
		76,
		77,
		78,
		79,
		80,
		81,
		82,
		83,
		84,
		85,
		86,
		87,
		88,
		89,
		90,
		91,
		92,
		93,
		94,
		95,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		96,
		97,
		98,
		99,
		100,
		101,
		102,
		103,
		104,
		105,
		106,
		107,
		108,
		109,
		110,
		0,
		111,
		112,
		113,
		114,
		0,
		115,
		116,
		117,
		118,
		119,
		120,
		121,
		122,
		0,
		123,
		0,
		124,
		125,
		126,
		127,
		128,
		129,
		130,
		131,
		0,
		132,
		133,
		0,
		134,
		135,
		136,
		137,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		138,
		0,
		139,
		0,
		0,
		0,
		0,
		140,
		141,
		142,
		143,
		0,
		0,
		0,
		0,
		0,
		144,
		0,
		0,
		0,
		145,
		0,
		0,
		146,
		147,
		148,
		149,
		0,
		0,
		0,
		0
	], Typr.CFF.glyphByUnicode = function(cff, code) {
		for (var i = 0; i < cff.charset.length; i++) if (cff.charset[i] == code) return i;
		return -1;
	}, Typr.CFF.glyphBySE = function(cff, charcode) {
		return charcode < 0 || charcode > 255 ? -1 : Typr.CFF.glyphByUnicode(cff, Typr.CFF.tableSE[charcode]);
	}, Typr.CFF.readEncoding = function(data, offset, num) {
		Typr._bin;
		var array = [".notdef"], format = data[offset];
		if (offset++, 0 != format) throw "error: unknown encoding format: " + format;
		var nCodes = data[offset];
		offset++;
		for (var i = 0; i < nCodes; i++) array.push(data[offset + i]);
		return array;
	}, Typr.CFF.readCharset = function(data, offset, num) {
		var bin = Typr._bin, charset = [".notdef"], format = data[offset];
		if (offset++, 0 == format) for (var i = 0; i < num; i++) {
			var first = bin.readUshort(data, offset);
			offset += 2, charset.push(first);
		}
		else {
			if (1 != format && 2 != format) throw "error: format: " + format;
			for (; charset.length < num;) {
				first = bin.readUshort(data, offset);
				offset += 2;
				var nLeft = 0;
				1 == format ? (nLeft = data[offset], offset++) : (nLeft = bin.readUshort(data, offset), offset += 2);
				for (i = 0; i <= nLeft; i++) charset.push(first), first++;
			}
		}
		return charset;
	}, Typr.CFF.readIndex = function(data, offset, inds) {
		var bin = Typr._bin, count = bin.readUshort(data, offset), offsize = data[offset += 2];
		if (offset++, 1 == offsize) for (var i = 0; i < count + 1; i++) inds.push(data[offset + i]);
		else if (2 == offsize) for (i = 0; i < count + 1; i++) inds.push(bin.readUshort(data, offset + 2 * i));
		else if (3 == offsize) for (i = 0; i < count + 1; i++) inds.push(16777215 & bin.readUint(data, offset + 3 * i - 1));
		else if (0 != count) throw "unsupported offset size: " + offsize + ", count: " + count;
		return (offset += (count + 1) * offsize) - 1;
	}, Typr.CFF.getCharString = function(data, offset, o) {
		var bin = Typr._bin, b0 = data[offset], b1 = data[offset + 1];
		data[offset + 2], data[offset + 3], data[offset + 4];
		var vs = 1, op = null, val = null;
		b0 <= 20 && (op = b0, vs = 1), 12 == b0 && (op = 100 * b0 + b1, vs = 2), 21 <= b0 && b0 <= 27 && (op = b0, vs = 1), 28 == b0 && (val = bin.readShort(data, offset + 1), vs = 3), 29 <= b0 && b0 <= 31 && (op = b0, vs = 1), 32 <= b0 && b0 <= 246 && (val = b0 - 139, vs = 1), 247 <= b0 && b0 <= 250 && (val = 256 * (b0 - 247) + b1 + 108, vs = 2), 251 <= b0 && b0 <= 254 && (val = 256 * -(b0 - 251) - b1 - 108, vs = 2), 255 == b0 && (val = bin.readInt(data, offset + 1) / 65535, vs = 5), o.val = null != val ? val : "o" + op, o.size = vs;
	}, Typr.CFF.readCharString = function(data, offset, length) {
		for (var end = offset + length, bin = Typr._bin, arr = []; offset < end;) {
			var b0 = data[offset], b1 = data[offset + 1];
			data[offset + 2], data[offset + 3], data[offset + 4];
			var vs = 1, op = null, val = null;
			b0 <= 20 && (op = b0, vs = 1), 12 == b0 && (op = 100 * b0 + b1, vs = 2), 19 != b0 && 20 != b0 || (op = b0, vs = 2), 21 <= b0 && b0 <= 27 && (op = b0, vs = 1), 28 == b0 && (val = bin.readShort(data, offset + 1), vs = 3), 29 <= b0 && b0 <= 31 && (op = b0, vs = 1), 32 <= b0 && b0 <= 246 && (val = b0 - 139, vs = 1), 247 <= b0 && b0 <= 250 && (val = 256 * (b0 - 247) + b1 + 108, vs = 2), 251 <= b0 && b0 <= 254 && (val = 256 * -(b0 - 251) - b1 - 108, vs = 2), 255 == b0 && (val = bin.readInt(data, offset + 1) / 65535, vs = 5), arr.push(null != val ? val : "o" + op), offset += vs;
		}
		return arr;
	}, Typr.CFF.readDict = function(data, offset, end) {
		for (var bin = Typr._bin, dict = {}, carr = []; offset < end;) {
			var b0 = data[offset], b1 = data[offset + 1];
			data[offset + 2], data[offset + 3], data[offset + 4];
			var vs = 1, key = null, val = null;
			if (28 == b0 && (val = bin.readShort(data, offset + 1), vs = 3), 29 == b0 && (val = bin.readInt(data, offset + 1), vs = 5), 32 <= b0 && b0 <= 246 && (val = b0 - 139, vs = 1), 247 <= b0 && b0 <= 250 && (val = 256 * (b0 - 247) + b1 + 108, vs = 2), 251 <= b0 && b0 <= 254 && (val = 256 * -(b0 - 251) - b1 - 108, vs = 2), 255 == b0) throw val = bin.readInt(data, offset + 1) / 65535, vs = 5, "unknown number";
			if (30 == b0) {
				var nibs = [];
				for (vs = 1;;) {
					var b = data[offset + vs];
					vs++;
					var nib0 = b >> 4, nib1 = 15 & b;
					if (15 != nib0 && nibs.push(nib0), 15 != nib1 && nibs.push(nib1), 15 == nib1) break;
				}
				for (var s = "", chars = [
					0,
					1,
					2,
					3,
					4,
					5,
					6,
					7,
					8,
					9,
					".",
					"e",
					"e-",
					"reserved",
					"-",
					"endOfNumber"
				], i = 0; i < nibs.length; i++) s += chars[nibs[i]];
				val = parseFloat(s);
			}
			if (b0 <= 21) {
				if (key = [
					"version",
					"Notice",
					"FullName",
					"FamilyName",
					"Weight",
					"FontBBox",
					"BlueValues",
					"OtherBlues",
					"FamilyBlues",
					"FamilyOtherBlues",
					"StdHW",
					"StdVW",
					"escape",
					"UniqueID",
					"XUID",
					"charset",
					"Encoding",
					"CharStrings",
					"Private",
					"Subrs",
					"defaultWidthX",
					"nominalWidthX"
				][b0], vs = 1, 12 == b0) key = [
					"Copyright",
					"isFixedPitch",
					"ItalicAngle",
					"UnderlinePosition",
					"UnderlineThickness",
					"PaintType",
					"CharstringType",
					"FontMatrix",
					"StrokeWidth",
					"BlueScale",
					"BlueShift",
					"BlueFuzz",
					"StemSnapH",
					"StemSnapV",
					"ForceBold",
					0,
					0,
					"LanguageGroup",
					"ExpansionFactor",
					"initialRandomSeed",
					"SyntheticBase",
					"PostScript",
					"BaseFontName",
					"BaseFontBlend",
					0,
					0,
					0,
					0,
					0,
					0,
					"ROS",
					"CIDFontVersion",
					"CIDFontRevision",
					"CIDFontType",
					"CIDCount",
					"UIDBase",
					"FDArray",
					"FDSelect",
					"FontName"
				][b1], vs = 2;
			}
			null != key ? (dict[key] = 1 == carr.length ? carr[0] : carr, carr = []) : carr.push(val), offset += vs;
		}
		return dict;
	}, Typr.cmap = {}, Typr.cmap.parse = function(data, offset, length) {
		data = new Uint8Array(data.buffer, offset, length), offset = 0;
		var bin = Typr._bin, obj = {};
		bin.readUshort(data, offset), offset += 2;
		var numTables = bin.readUshort(data, offset);
		offset += 2;
		var offs = [];
		obj.tables = [];
		for (var i = 0; i < numTables; i++) {
			var platformID = bin.readUshort(data, offset);
			offset += 2;
			var encodingID = bin.readUshort(data, offset);
			offset += 2;
			var noffset = bin.readUint(data, offset);
			offset += 4;
			var id = "p" + platformID + "e" + encodingID, tind = offs.indexOf(noffset);
			if (-1 == tind) {
				var subt;
				tind = obj.tables.length, offs.push(noffset);
				var format = bin.readUshort(data, noffset);
				0 == format ? subt = Typr.cmap.parse0(data, noffset) : 4 == format ? subt = Typr.cmap.parse4(data, noffset) : 6 == format ? subt = Typr.cmap.parse6(data, noffset) : 12 == format ? subt = Typr.cmap.parse12(data, noffset) : console.log("unknown format: " + format, platformID, encodingID, noffset), obj.tables.push(subt);
			}
			if (null != obj[id]) throw "multiple tables for one platform+encoding";
			obj[id] = tind;
		}
		return obj;
	}, Typr.cmap.parse0 = function(data, offset) {
		var bin = Typr._bin, obj = {};
		obj.format = bin.readUshort(data, offset), offset += 2;
		var len = bin.readUshort(data, offset);
		offset += 2, bin.readUshort(data, offset), offset += 2, obj.map = [];
		for (var i = 0; i < len - 6; i++) obj.map.push(data[offset + i]);
		return obj;
	}, Typr.cmap.parse4 = function(data, offset) {
		var bin = Typr._bin, offset0 = offset, obj = {};
		obj.format = bin.readUshort(data, offset), offset += 2;
		var length = bin.readUshort(data, offset);
		offset += 2, bin.readUshort(data, offset), offset += 2;
		var segCountX2 = bin.readUshort(data, offset);
		offset += 2;
		var segCount = segCountX2 / 2;
		obj.searchRange = bin.readUshort(data, offset), offset += 2, obj.entrySelector = bin.readUshort(data, offset), offset += 2, obj.rangeShift = bin.readUshort(data, offset), offset += 2, obj.endCount = bin.readUshorts(data, offset, segCount), offset += 2 * segCount, offset += 2, obj.startCount = bin.readUshorts(data, offset, segCount), offset += 2 * segCount, obj.idDelta = [];
		for (var i = 0; i < segCount; i++) obj.idDelta.push(bin.readShort(data, offset)), offset += 2;
		for (obj.idRangeOffset = bin.readUshorts(data, offset, segCount), offset += 2 * segCount, obj.glyphIdArray = []; offset < offset0 + length;) obj.glyphIdArray.push(bin.readUshort(data, offset)), offset += 2;
		return obj;
	}, Typr.cmap.parse6 = function(data, offset) {
		var bin = Typr._bin, obj = {};
		obj.format = bin.readUshort(data, offset), offset += 2, bin.readUshort(data, offset), offset += 2, bin.readUshort(data, offset), offset += 2, obj.firstCode = bin.readUshort(data, offset), offset += 2;
		var entryCount = bin.readUshort(data, offset);
		offset += 2, obj.glyphIdArray = [];
		for (var i = 0; i < entryCount; i++) obj.glyphIdArray.push(bin.readUshort(data, offset)), offset += 2;
		return obj;
	}, Typr.cmap.parse12 = function(data, offset) {
		var bin = Typr._bin, obj = {};
		obj.format = bin.readUshort(data, offset), offset += 2, offset += 2, bin.readUint(data, offset), offset += 4, bin.readUint(data, offset), offset += 4;
		var nGroups = bin.readUint(data, offset);
		offset += 4, obj.groups = [];
		for (var i = 0; i < nGroups; i++) {
			var off = offset + 12 * i, startCharCode = bin.readUint(data, off + 0), endCharCode = bin.readUint(data, off + 4), startGlyphID = bin.readUint(data, off + 8);
			obj.groups.push([
				startCharCode,
				endCharCode,
				startGlyphID
			]);
		}
		return obj;
	}, Typr.glyf = {}, Typr.glyf.parse = function(data, offset, length, font) {
		for (var obj = [], g = 0; g < font.maxp.numGlyphs; g++) obj.push(null);
		return obj;
	}, Typr.glyf._parseGlyf = function(font, g) {
		var bin = Typr._bin, data = font._data, offset = Typr._tabOffset(data, "glyf") + font.loca[g];
		if (font.loca[g] == font.loca[g + 1]) return null;
		var gl = {};
		if (gl.noc = bin.readShort(data, offset), offset += 2, gl.xMin = bin.readShort(data, offset), offset += 2, gl.yMin = bin.readShort(data, offset), offset += 2, gl.xMax = bin.readShort(data, offset), offset += 2, gl.yMax = bin.readShort(data, offset), offset += 2, gl.xMin >= gl.xMax || gl.yMin >= gl.yMax) return null;
		if (gl.noc > 0) {
			gl.endPts = [];
			for (var i = 0; i < gl.noc; i++) gl.endPts.push(bin.readUshort(data, offset)), offset += 2;
			var instructionLength = bin.readUshort(data, offset);
			if (offset += 2, data.length - offset < instructionLength) return null;
			gl.instructions = bin.readBytes(data, offset, instructionLength), offset += instructionLength;
			var crdnum = gl.endPts[gl.noc - 1] + 1;
			gl.flags = [];
			for (i = 0; i < crdnum; i++) {
				var flag = data[offset];
				if (offset++, gl.flags.push(flag), 0 != (8 & flag)) {
					var rep = data[offset];
					offset++;
					for (var j = 0; j < rep; j++) gl.flags.push(flag), i++;
				}
			}
			gl.xs = [];
			for (i = 0; i < crdnum; i++) {
				var i8 = 0 != (2 & gl.flags[i]), same = 0 != (16 & gl.flags[i]);
				i8 ? (gl.xs.push(same ? data[offset] : -data[offset]), offset++) : same ? gl.xs.push(0) : (gl.xs.push(bin.readShort(data, offset)), offset += 2);
			}
			gl.ys = [];
			for (i = 0; i < crdnum; i++) {
				i8 = 0 != (4 & gl.flags[i]), same = 0 != (32 & gl.flags[i]);
				i8 ? (gl.ys.push(same ? data[offset] : -data[offset]), offset++) : same ? gl.ys.push(0) : (gl.ys.push(bin.readShort(data, offset)), offset += 2);
			}
			var x = 0, y = 0;
			for (i = 0; i < crdnum; i++) x += gl.xs[i], y += gl.ys[i], gl.xs[i] = x, gl.ys[i] = y;
		} else {
			var flags;
			gl.parts = [];
			do {
				flags = bin.readUshort(data, offset), offset += 2;
				var part = {
					m: {
						a: 1,
						b: 0,
						c: 0,
						d: 1,
						tx: 0,
						ty: 0
					},
					p1: -1,
					p2: -1
				};
				if (gl.parts.push(part), part.glyphIndex = bin.readUshort(data, offset), offset += 2, 1 & flags) {
					var arg1 = bin.readShort(data, offset);
					offset += 2;
					var arg2 = bin.readShort(data, offset);
					offset += 2;
				} else {
					arg1 = bin.readInt8(data, offset);
					offset++;
					arg2 = bin.readInt8(data, offset);
					offset++;
				}
				2 & flags ? (part.m.tx = arg1, part.m.ty = arg2) : (part.p1 = arg1, part.p2 = arg2), 8 & flags ? (part.m.a = part.m.d = bin.readF2dot14(data, offset), offset += 2) : 64 & flags ? (part.m.a = bin.readF2dot14(data, offset), offset += 2, part.m.d = bin.readF2dot14(data, offset), offset += 2) : 128 & flags && (part.m.a = bin.readF2dot14(data, offset), offset += 2, part.m.b = bin.readF2dot14(data, offset), offset += 2, part.m.c = bin.readF2dot14(data, offset), offset += 2, part.m.d = bin.readF2dot14(data, offset), offset += 2);
			} while (32 & flags);
			if (256 & flags) {
				var numInstr = bin.readUshort(data, offset);
				offset += 2, gl.instr = [];
				for (i = 0; i < numInstr; i++) gl.instr.push(data[offset]), offset++;
			}
		}
		return gl;
	}, Typr.GPOS = {}, Typr.GPOS.parse = function(data, offset, length, font) {
		return Typr._lctf.parse(data, offset, length, font, Typr.GPOS.subt);
	}, Typr.GPOS.subt = function(data, ltype, offset) {
		if (2 != ltype) return null;
		var bin = Typr._bin, offset0 = offset, tab = {};
		tab.format = bin.readUshort(data, offset), offset += 2;
		var covOff = bin.readUshort(data, offset);
		offset += 2, tab.coverage = Typr._lctf.readCoverage(data, covOff + offset0), tab.valFmt1 = bin.readUshort(data, offset), offset += 2, tab.valFmt2 = bin.readUshort(data, offset), offset += 2;
		var ones1 = Typr._lctf.numOfOnes(tab.valFmt1), ones2 = Typr._lctf.numOfOnes(tab.valFmt2);
		if (1 == tab.format) {
			tab.pairsets = [];
			var count = bin.readUshort(data, offset);
			offset += 2;
			for (var i = 0; i < count; i++) {
				var psoff = bin.readUshort(data, offset);
				offset += 2, psoff += offset0;
				var pvcount = bin.readUshort(data, psoff);
				psoff += 2;
				for (var arr = [], j = 0; j < pvcount; j++) {
					var gid2 = bin.readUshort(data, psoff);
					psoff += 2, 0 != tab.valFmt1 && (value1 = Typr._lctf.readValueRecord(data, psoff, tab.valFmt1), psoff += 2 * ones1), 0 != tab.valFmt2 && (value2 = Typr._lctf.readValueRecord(data, psoff, tab.valFmt2), psoff += 2 * ones2), arr.push({
						gid2,
						val1: value1,
						val2: value2
					});
				}
				tab.pairsets.push(arr);
			}
		}
		if (2 == tab.format) {
			var classDef1 = bin.readUshort(data, offset);
			offset += 2;
			var classDef2 = bin.readUshort(data, offset);
			offset += 2;
			var class1Count = bin.readUshort(data, offset);
			offset += 2;
			var class2Count = bin.readUshort(data, offset);
			offset += 2, tab.classDef1 = Typr._lctf.readClassDef(data, offset0 + classDef1), tab.classDef2 = Typr._lctf.readClassDef(data, offset0 + classDef2), tab.matrix = [];
			for (i = 0; i < class1Count; i++) {
				var row = [];
				for (j = 0; j < class2Count; j++) {
					var value1 = null, value2 = null;
					0 != tab.valFmt1 && (value1 = Typr._lctf.readValueRecord(data, offset, tab.valFmt1), offset += 2 * ones1), 0 != tab.valFmt2 && (value2 = Typr._lctf.readValueRecord(data, offset, tab.valFmt2), offset += 2 * ones2), row.push({
						val1: value1,
						val2: value2
					});
				}
				tab.matrix.push(row);
			}
		}
		return tab;
	}, Typr.GSUB = {}, Typr.GSUB.parse = function(data, offset, length, font) {
		return Typr._lctf.parse(data, offset, length, font, Typr.GSUB.subt);
	}, Typr.GSUB.subt = function(data, ltype, offset) {
		var bin = Typr._bin, offset0 = offset, tab = {};
		if (1 != ltype && 4 != ltype && 5 != ltype) return null;
		tab.fmt = bin.readUshort(data, offset), offset += 2;
		var covOff = bin.readUshort(data, offset);
		if (offset += 2, tab.coverage = Typr._lctf.readCoverage(data, covOff + offset0), 1 == ltype) {
			if (1 == tab.fmt) tab.delta = bin.readShort(data, offset), offset += 2;
			else if (2 == tab.fmt) {
				var cnt = bin.readUshort(data, offset);
				offset += 2, tab.newg = bin.readUshorts(data, offset, cnt), offset += 2 * tab.newg.length;
			}
		} else if (4 == ltype) {
			tab.vals = [];
			cnt = bin.readUshort(data, offset);
			offset += 2;
			for (var i = 0; i < cnt; i++) {
				var loff = bin.readUshort(data, offset);
				offset += 2, tab.vals.push(Typr.GSUB.readLigatureSet(data, offset0 + loff));
			}
		} else if (5 == ltype) if (2 == tab.fmt) {
			var cDefOffset = bin.readUshort(data, offset);
			offset += 2, tab.cDef = Typr._lctf.readClassDef(data, offset0 + cDefOffset), tab.scset = [];
			var subClassSetCount = bin.readUshort(data, offset);
			offset += 2;
			for (i = 0; i < subClassSetCount; i++) {
				var scsOff = bin.readUshort(data, offset);
				offset += 2, tab.scset.push(0 == scsOff ? null : Typr.GSUB.readSubClassSet(data, offset0 + scsOff));
			}
		} else console.log("unknown table format", tab.fmt);
		return tab;
	}, Typr.GSUB.readSubClassSet = function(data, offset) {
		var rUs = Typr._bin.readUshort, offset0 = offset, lset = [], cnt = rUs(data, offset);
		offset += 2;
		for (var i = 0; i < cnt; i++) {
			var loff = rUs(data, offset);
			offset += 2, lset.push(Typr.GSUB.readSubClassRule(data, offset0 + loff));
		}
		return lset;
	}, Typr.GSUB.readSubClassRule = function(data, offset) {
		var rUs = Typr._bin.readUshort, rule = {}, gcount = rUs(data, offset), scount = rUs(data, offset += 2);
		offset += 2, rule.input = [];
		for (var i = 0; i < gcount - 1; i++) rule.input.push(rUs(data, offset)), offset += 2;
		return rule.substLookupRecords = Typr.GSUB.readSubstLookupRecords(data, offset, scount), rule;
	}, Typr.GSUB.readSubstLookupRecords = function(data, offset, cnt) {
		for (var rUs = Typr._bin.readUshort, out = [], i = 0; i < cnt; i++) out.push(rUs(data, offset), rUs(data, offset + 2)), offset += 4;
		return out;
	}, Typr.GSUB.readChainSubClassSet = function(data, offset) {
		var bin = Typr._bin, offset0 = offset, lset = [], cnt = bin.readUshort(data, offset);
		offset += 2;
		for (var i = 0; i < cnt; i++) {
			var loff = bin.readUshort(data, offset);
			offset += 2, lset.push(Typr.GSUB.readChainSubClassRule(data, offset0 + loff));
		}
		return lset;
	}, Typr.GSUB.readChainSubClassRule = function(data, offset) {
		for (var bin = Typr._bin, rule = {}, pps = [
			"backtrack",
			"input",
			"lookahead"
		], pi = 0; pi < pps.length; pi++) {
			var cnt = bin.readUshort(data, offset);
			offset += 2, 1 == pi && cnt--, rule[pps[pi]] = bin.readUshorts(data, offset, cnt), offset += 2 * rule[pps[pi]].length;
		}
		cnt = bin.readUshort(data, offset);
		return offset += 2, rule.subst = bin.readUshorts(data, offset, 2 * cnt), offset += 2 * rule.subst.length, rule;
	}, Typr.GSUB.readLigatureSet = function(data, offset) {
		var bin = Typr._bin, offset0 = offset, lset = [], lcnt = bin.readUshort(data, offset);
		offset += 2;
		for (var j = 0; j < lcnt; j++) {
			var loff = bin.readUshort(data, offset);
			offset += 2, lset.push(Typr.GSUB.readLigature(data, offset0 + loff));
		}
		return lset;
	}, Typr.GSUB.readLigature = function(data, offset) {
		var bin = Typr._bin, lig = { chain: [] };
		lig.nglyph = bin.readUshort(data, offset), offset += 2;
		var ccnt = bin.readUshort(data, offset);
		offset += 2;
		for (var k = 0; k < ccnt - 1; k++) lig.chain.push(bin.readUshort(data, offset)), offset += 2;
		return lig;
	}, Typr.head = {}, Typr.head.parse = function(data, offset, length) {
		var bin = Typr._bin, obj = {};
		return bin.readFixed(data, offset), offset += 4, obj.fontRevision = bin.readFixed(data, offset), offset += 4, bin.readUint(data, offset), offset += 4, bin.readUint(data, offset), offset += 4, obj.flags = bin.readUshort(data, offset), offset += 2, obj.unitsPerEm = bin.readUshort(data, offset), offset += 2, obj.created = bin.readUint64(data, offset), offset += 8, obj.modified = bin.readUint64(data, offset), offset += 8, obj.xMin = bin.readShort(data, offset), offset += 2, obj.yMin = bin.readShort(data, offset), offset += 2, obj.xMax = bin.readShort(data, offset), offset += 2, obj.yMax = bin.readShort(data, offset), offset += 2, obj.macStyle = bin.readUshort(data, offset), offset += 2, obj.lowestRecPPEM = bin.readUshort(data, offset), offset += 2, obj.fontDirectionHint = bin.readShort(data, offset), offset += 2, obj.indexToLocFormat = bin.readShort(data, offset), offset += 2, obj.glyphDataFormat = bin.readShort(data, offset), offset += 2, obj;
	}, Typr.hhea = {}, Typr.hhea.parse = function(data, offset, length) {
		var bin = Typr._bin, obj = {};
		return bin.readFixed(data, offset), offset += 4, obj.ascender = bin.readShort(data, offset), offset += 2, obj.descender = bin.readShort(data, offset), offset += 2, obj.lineGap = bin.readShort(data, offset), offset += 2, obj.advanceWidthMax = bin.readUshort(data, offset), offset += 2, obj.minLeftSideBearing = bin.readShort(data, offset), offset += 2, obj.minRightSideBearing = bin.readShort(data, offset), offset += 2, obj.xMaxExtent = bin.readShort(data, offset), offset += 2, obj.caretSlopeRise = bin.readShort(data, offset), offset += 2, obj.caretSlopeRun = bin.readShort(data, offset), offset += 2, obj.caretOffset = bin.readShort(data, offset), offset += 2, offset += 8, obj.metricDataFormat = bin.readShort(data, offset), offset += 2, obj.numberOfHMetrics = bin.readUshort(data, offset), offset += 2, obj;
	}, Typr.hmtx = {}, Typr.hmtx.parse = function(data, offset, length, font) {
		for (var bin = Typr._bin, obj = {
			aWidth: [],
			lsBearing: []
		}, aw = 0, lsb = 0, i = 0; i < font.maxp.numGlyphs; i++) i < font.hhea.numberOfHMetrics && (aw = bin.readUshort(data, offset), offset += 2, lsb = bin.readShort(data, offset), offset += 2), obj.aWidth.push(aw), obj.lsBearing.push(lsb);
		return obj;
	}, Typr.kern = {}, Typr.kern.parse = function(data, offset, length, font) {
		var bin = Typr._bin, version = bin.readUshort(data, offset);
		if (offset += 2, 1 == version) return Typr.kern.parseV1(data, offset - 2, length, font);
		var nTables = bin.readUshort(data, offset);
		offset += 2;
		for (var map = {
			glyph1: [],
			rval: []
		}, i = 0; i < nTables; i++) {
			offset += 2;
			length = bin.readUshort(data, offset);
			offset += 2;
			var coverage = bin.readUshort(data, offset);
			offset += 2;
			var format = coverage >>> 8;
			if (0 != (format &= 15)) throw "unknown kern table format: " + format;
			offset = Typr.kern.readFormat0(data, offset, map);
		}
		return map;
	}, Typr.kern.parseV1 = function(data, offset, length, font) {
		var bin = Typr._bin;
		bin.readFixed(data, offset), offset += 4;
		var nTables = bin.readUint(data, offset);
		offset += 4;
		for (var map = {
			glyph1: [],
			rval: []
		}, i = 0; i < nTables; i++) {
			bin.readUint(data, offset), offset += 4;
			var coverage = bin.readUshort(data, offset);
			offset += 2, bin.readUshort(data, offset), offset += 2;
			var format = coverage >>> 8;
			if (0 != (format &= 15)) throw "unknown kern table format: " + format;
			offset = Typr.kern.readFormat0(data, offset, map);
		}
		return map;
	}, Typr.kern.readFormat0 = function(data, offset, map) {
		var bin = Typr._bin, pleft = -1, nPairs = bin.readUshort(data, offset);
		offset += 2, bin.readUshort(data, offset), offset += 2, bin.readUshort(data, offset), offset += 2, bin.readUshort(data, offset), offset += 2;
		for (var j = 0; j < nPairs; j++) {
			var left = bin.readUshort(data, offset);
			offset += 2;
			var right = bin.readUshort(data, offset);
			offset += 2;
			var value = bin.readShort(data, offset);
			offset += 2, left != pleft && (map.glyph1.push(left), map.rval.push({
				glyph2: [],
				vals: []
			}));
			var rval = map.rval[map.rval.length - 1];
			rval.glyph2.push(right), rval.vals.push(value), pleft = left;
		}
		return offset;
	}, Typr.loca = {}, Typr.loca.parse = function(data, offset, length, font) {
		var bin = Typr._bin, obj = [], ver = font.head.indexToLocFormat, len = font.maxp.numGlyphs + 1;
		if (0 == ver) for (var i = 0; i < len; i++) obj.push(bin.readUshort(data, offset + (i << 1)) << 1);
		if (1 == ver) for (i = 0; i < len; i++) obj.push(bin.readUint(data, offset + (i << 2)));
		return obj;
	}, Typr.maxp = {}, Typr.maxp.parse = function(data, offset, length) {
		var bin = Typr._bin, obj = {}, ver = bin.readUint(data, offset);
		return offset += 4, obj.numGlyphs = bin.readUshort(data, offset), offset += 2, 65536 == ver && (obj.maxPoints = bin.readUshort(data, offset), offset += 2, obj.maxContours = bin.readUshort(data, offset), offset += 2, obj.maxCompositePoints = bin.readUshort(data, offset), offset += 2, obj.maxCompositeContours = bin.readUshort(data, offset), offset += 2, obj.maxZones = bin.readUshort(data, offset), offset += 2, obj.maxTwilightPoints = bin.readUshort(data, offset), offset += 2, obj.maxStorage = bin.readUshort(data, offset), offset += 2, obj.maxFunctionDefs = bin.readUshort(data, offset), offset += 2, obj.maxInstructionDefs = bin.readUshort(data, offset), offset += 2, obj.maxStackElements = bin.readUshort(data, offset), offset += 2, obj.maxSizeOfInstructions = bin.readUshort(data, offset), offset += 2, obj.maxComponentElements = bin.readUshort(data, offset), offset += 2, obj.maxComponentDepth = bin.readUshort(data, offset), offset += 2), obj;
	}, Typr.name = {}, Typr.name.parse = function(data, offset, length) {
		var bin = Typr._bin, obj = {};
		bin.readUshort(data, offset), offset += 2;
		var count = bin.readUshort(data, offset);
		offset += 2, bin.readUshort(data, offset);
		for (var tname, offset0 = offset += 2, i = 0; i < count; i++) {
			var platformID = bin.readUshort(data, offset);
			offset += 2;
			var encodingID = bin.readUshort(data, offset);
			offset += 2;
			var languageID = bin.readUshort(data, offset);
			offset += 2;
			var nameID = bin.readUshort(data, offset);
			offset += 2;
			length = bin.readUshort(data, offset);
			offset += 2;
			var noffset = bin.readUshort(data, offset);
			offset += 2;
			var plat = "p" + platformID;
			obj[plat] ?? (obj[plat] = {});
			var str, cname = [
				"copyright",
				"fontFamily",
				"fontSubfamily",
				"ID",
				"fullName",
				"version",
				"postScriptName",
				"trademark",
				"manufacturer",
				"designer",
				"description",
				"urlVendor",
				"urlDesigner",
				"licence",
				"licenceURL",
				"---",
				"typoFamilyName",
				"typoSubfamilyName",
				"compatibleFull",
				"sampleText",
				"postScriptCID",
				"wwsFamilyName",
				"wwsSubfamilyName",
				"lightPalette",
				"darkPalette"
			][nameID], soff = offset0 + 12 * count + noffset;
			if (0 == platformID) str = bin.readUnicode(data, soff, length / 2);
			else if (3 == platformID && 0 == encodingID) str = bin.readUnicode(data, soff, length / 2);
			else if (0 == encodingID) str = bin.readASCII(data, soff, length);
			else if (1 == encodingID) str = bin.readUnicode(data, soff, length / 2);
			else if (3 == encodingID) str = bin.readUnicode(data, soff, length / 2);
			else {
				if (1 != platformID) throw "unknown encoding " + encodingID + ", platformID: " + platformID;
				str = bin.readASCII(data, soff, length), console.log("reading unknown MAC encoding " + encodingID + " as ASCII");
			}
			obj[plat][cname] = str, obj[plat]._lang = languageID;
		}
		for (var p in obj) if (null != obj[p].postScriptName && 1033 == obj[p]._lang) return obj[p];
		for (var p in obj) if (null != obj[p].postScriptName && 3084 == obj[p]._lang) return obj[p];
		for (var p in obj) if (null != obj[p].postScriptName) return obj[p];
		for (var p in obj) {
			tname = p;
			break;
		}
		return console.log("returning name table with languageID " + obj[tname]._lang), obj[tname];
	}, Typr["OS/2"] = {}, Typr["OS/2"].parse = function(data, offset, length) {
		var ver = Typr._bin.readUshort(data, offset);
		offset += 2;
		var obj = {};
		if (0 == ver) Typr["OS/2"].version0(data, offset, obj);
		else if (1 == ver) Typr["OS/2"].version1(data, offset, obj);
		else if (2 == ver || 3 == ver || 4 == ver) Typr["OS/2"].version2(data, offset, obj);
		else {
			if (5 != ver) throw "unknown OS/2 table version: " + ver;
			Typr["OS/2"].version5(data, offset, obj);
		}
		return obj;
	}, Typr["OS/2"].version0 = function(data, offset, obj) {
		var bin = Typr._bin;
		return obj.xAvgCharWidth = bin.readShort(data, offset), offset += 2, obj.usWeightClass = bin.readUshort(data, offset), offset += 2, obj.usWidthClass = bin.readUshort(data, offset), offset += 2, obj.fsType = bin.readUshort(data, offset), offset += 2, obj.ySubscriptXSize = bin.readShort(data, offset), offset += 2, obj.ySubscriptYSize = bin.readShort(data, offset), offset += 2, obj.ySubscriptXOffset = bin.readShort(data, offset), offset += 2, obj.ySubscriptYOffset = bin.readShort(data, offset), offset += 2, obj.ySuperscriptXSize = bin.readShort(data, offset), offset += 2, obj.ySuperscriptYSize = bin.readShort(data, offset), offset += 2, obj.ySuperscriptXOffset = bin.readShort(data, offset), offset += 2, obj.ySuperscriptYOffset = bin.readShort(data, offset), offset += 2, obj.yStrikeoutSize = bin.readShort(data, offset), offset += 2, obj.yStrikeoutPosition = bin.readShort(data, offset), offset += 2, obj.sFamilyClass = bin.readShort(data, offset), offset += 2, obj.panose = bin.readBytes(data, offset, 10), offset += 10, obj.ulUnicodeRange1 = bin.readUint(data, offset), offset += 4, obj.ulUnicodeRange2 = bin.readUint(data, offset), offset += 4, obj.ulUnicodeRange3 = bin.readUint(data, offset), offset += 4, obj.ulUnicodeRange4 = bin.readUint(data, offset), offset += 4, obj.achVendID = [
			bin.readInt8(data, offset),
			bin.readInt8(data, offset + 1),
			bin.readInt8(data, offset + 2),
			bin.readInt8(data, offset + 3)
		], offset += 4, obj.fsSelection = bin.readUshort(data, offset), offset += 2, obj.usFirstCharIndex = bin.readUshort(data, offset), offset += 2, obj.usLastCharIndex = bin.readUshort(data, offset), offset += 2, obj.sTypoAscender = bin.readShort(data, offset), offset += 2, obj.sTypoDescender = bin.readShort(data, offset), offset += 2, obj.sTypoLineGap = bin.readShort(data, offset), offset += 2, obj.usWinAscent = bin.readUshort(data, offset), offset += 2, obj.usWinDescent = bin.readUshort(data, offset), offset += 2;
	}, Typr["OS/2"].version1 = function(data, offset, obj) {
		var bin = Typr._bin;
		return offset = Typr["OS/2"].version0(data, offset, obj), obj.ulCodePageRange1 = bin.readUint(data, offset), offset += 4, obj.ulCodePageRange2 = bin.readUint(data, offset), offset += 4;
	}, Typr["OS/2"].version2 = function(data, offset, obj) {
		var bin = Typr._bin;
		return offset = Typr["OS/2"].version1(data, offset, obj), obj.sxHeight = bin.readShort(data, offset), offset += 2, obj.sCapHeight = bin.readShort(data, offset), offset += 2, obj.usDefault = bin.readUshort(data, offset), offset += 2, obj.usBreak = bin.readUshort(data, offset), offset += 2, obj.usMaxContext = bin.readUshort(data, offset), offset += 2;
	}, Typr["OS/2"].version5 = function(data, offset, obj) {
		var bin = Typr._bin;
		return offset = Typr["OS/2"].version2(data, offset, obj), obj.usLowerOpticalPointSize = bin.readUshort(data, offset), offset += 2, obj.usUpperOpticalPointSize = bin.readUshort(data, offset), offset += 2;
	}, Typr.post = {}, Typr.post.parse = function(data, offset, length) {
		var bin = Typr._bin, obj = {};
		return obj.version = bin.readFixed(data, offset), offset += 4, obj.italicAngle = bin.readFixed(data, offset), offset += 4, obj.underlinePosition = bin.readShort(data, offset), offset += 2, obj.underlineThickness = bin.readShort(data, offset), offset += 2, obj;
	}, Typr.SVG = {}, Typr.SVG.parse = function(data, offset, length) {
		var bin = Typr._bin, obj = { entries: [] }, offset0 = offset;
		bin.readUshort(data, offset), offset += 2;
		var svgDocIndexOffset = bin.readUint(data, offset);
		offset += 4, bin.readUint(data, offset), offset += 4, offset = svgDocIndexOffset + offset0;
		var numEntries = bin.readUshort(data, offset);
		offset += 2;
		for (var i = 0; i < numEntries; i++) {
			var startGlyphID = bin.readUshort(data, offset);
			offset += 2;
			var endGlyphID = bin.readUshort(data, offset);
			offset += 2;
			var svgDocOffset = bin.readUint(data, offset);
			offset += 4;
			var svgDocLength = bin.readUint(data, offset);
			offset += 4;
			for (var sbuf = new Uint8Array(data.buffer, offset0 + svgDocOffset + svgDocIndexOffset, svgDocLength), svg = bin.readUTF8(sbuf, 0, sbuf.length), f = startGlyphID; f <= endGlyphID; f++) obj.entries[f] = svg;
		}
		return obj;
	}, Typr.SVG.toPath = function(str) {
		var pth = {
			cmds: [],
			crds: []
		};
		if (null == str) return pth;
		for (var svg = new DOMParser().parseFromString(str, "image/svg+xml").firstChild; "svg" != svg.tagName;) svg = svg.nextSibling;
		var vb = svg.getAttribute("viewBox");
		vb = vb ? vb.trim().split(" ").map(parseFloat) : [
			0,
			0,
			1e3,
			1e3
		], Typr.SVG._toPath(svg.children, pth);
		for (var i = 0; i < pth.crds.length; i += 2) {
			var x = pth.crds[i], y = pth.crds[i + 1];
			x -= vb[0], y = -(y -= vb[1]), pth.crds[i] = x, pth.crds[i + 1] = y;
		}
		return pth;
	}, Typr.SVG._toPath = function(nds, pth, fill) {
		for (var ni = 0; ni < nds.length; ni++) {
			var nd = nds[ni], tn = nd.tagName, cfl = nd.getAttribute("fill");
			if (cfl ?? (cfl = fill), "g" == tn) Typr.SVG._toPath(nd.children, pth, cfl);
			else if ("path" == tn) {
				pth.cmds.push(cfl || "#000000");
				var d = nd.getAttribute("d"), toks = Typr.SVG._tokens(d);
				Typr.SVG._toksToPath(toks, pth), pth.cmds.push("X");
			} else "defs" == tn || console.log(tn, nd);
		}
	}, Typr.SVG._tokens = function(d) {
		for (var ts = [], off = 0, rn = false, cn = ""; off < d.length;) {
			var cc = d.charCodeAt(off), ch = d.charAt(off);
			off++;
			var isNum = 48 <= cc && cc <= 57 || "." == ch || "-" == ch;
			rn ? "-" == ch ? (ts.push(parseFloat(cn)), cn = ch) : isNum ? cn += ch : (ts.push(parseFloat(cn)), "," != ch && " " != ch && ts.push(ch), rn = false) : isNum ? (cn = ch, rn = true) : "," != ch && " " != ch && ts.push(ch);
		}
		return rn && ts.push(parseFloat(cn)), ts;
	}, Typr.SVG._toksToPath = function(ts, pth) {
		for (var i = 0, x = 0, y = 0, ox = 0, oy = 0, pc = {
			M: 2,
			L: 2,
			H: 1,
			V: 1,
			S: 4,
			C: 6
		}, cmds = pth.cmds, crds = pth.crds; i < ts.length;) {
			var cmd = ts[i];
			if (i++, "z" == cmd) cmds.push("Z"), x = ox, y = oy;
			else for (var cmu = cmd.toUpperCase(), ps = pc[cmu], reps = Typr.SVG._reps(ts, i, ps), j = 0; j < reps; j++) {
				var xi = 0, yi = 0;
				if (cmd != cmu && (xi = x, yi = y), "M" == cmu) x = xi + ts[i++], y = yi + ts[i++], cmds.push("M"), crds.push(x, y), ox = x, oy = y;
				else if ("L" == cmu) x = xi + ts[i++], y = yi + ts[i++], cmds.push("L"), crds.push(x, y);
				else if ("H" == cmu) x = xi + ts[i++], cmds.push("L"), crds.push(x, y);
				else if ("V" == cmu) y = yi + ts[i++], cmds.push("L"), crds.push(x, y);
				else if ("C" == cmu) {
					var x1 = xi + ts[i++], y1 = yi + ts[i++], x2 = xi + ts[i++], y2 = yi + ts[i++], x3 = xi + ts[i++], y3 = yi + ts[i++];
					cmds.push("C"), crds.push(x1, y1, x2, y2, x3, y3), x = x3, y = y3;
				} else if ("S" == cmu) {
					var co = Math.max(crds.length - 4, 0);
					x1 = x + x - crds[co], y1 = y + y - crds[co + 1], x2 = xi + ts[i++], y2 = yi + ts[i++], x3 = xi + ts[i++], y3 = yi + ts[i++];
					cmds.push("C"), crds.push(x1, y1, x2, y2, x3, y3), x = x3, y = y3;
				} else console.log("Unknown SVG command " + cmd);
			}
		}
	}, Typr.SVG._reps = function(ts, off, ps) {
		for (var i = off; i < ts.length && "string" != typeof ts[i];) i += ps;
		return (i - off) / ps;
	}, Typr ?? (Typr = {}), Typr.U ?? (Typr.U = {}), Typr.U.codeToGlyph = function(font, code) {
		var cmap = font.cmap, tind = -1;
		if (null != cmap.p0e4 ? tind = cmap.p0e4 : null != cmap.p3e1 ? tind = cmap.p3e1 : null != cmap.p1e0 && (tind = cmap.p1e0), -1 == tind) throw "no familiar platform and encoding!";
		var tab = cmap.tables[tind];
		if (0 == tab.format) return code >= tab.map.length ? 0 : tab.map[code];
		if (4 == tab.format) {
			for (var sind = -1, i = 0; i < tab.endCount.length; i++) if (code <= tab.endCount[i]) {
				sind = i;
				break;
			}
			if (-1 == sind) return 0;
			if (tab.startCount[sind] > code) return 0;
			return 65535 & (0 != tab.idRangeOffset[sind] ? tab.glyphIdArray[code - tab.startCount[sind] + (tab.idRangeOffset[sind] >> 1) - (tab.idRangeOffset.length - sind)] : code + tab.idDelta[sind]);
		}
		if (12 == tab.format) {
			if (code > tab.groups[tab.groups.length - 1][1]) return 0;
			for (i = 0; i < tab.groups.length; i++) {
				var grp = tab.groups[i];
				if (grp[0] <= code && code <= grp[1]) return grp[2] + (code - grp[0]);
			}
			return 0;
		}
		throw "unknown cmap table format " + tab.format;
	}, Typr.U.glyphToPath = function(font, gid) {
		var path = {
			cmds: [],
			crds: []
		};
		if (font.SVG && font.SVG.entries[gid]) {
			var p = font.SVG.entries[gid];
			return null == p ? path : ("string" == typeof p && (p = Typr.SVG.toPath(p), font.SVG.entries[gid] = p), p);
		}
		if (font.CFF) {
			var state = {
				x: 0,
				y: 0,
				stack: [],
				nStems: 0,
				haveWidth: false,
				width: font.CFF.Private ? font.CFF.Private.defaultWidthX : 0,
				open: false
			};
			Typr.U._drawCFF(font.CFF.CharStrings[gid], state, font.CFF, path);
		} else font.glyf && Typr.U._drawGlyf(gid, font, path);
		return path;
	}, Typr.U._drawGlyf = function(gid, font, path) {
		var gl = font.glyf[gid];
		gl ?? (gl = font.glyf[gid] = Typr.glyf._parseGlyf(font, gid)), null != gl && (gl.noc > -1 ? Typr.U._simpleGlyph(gl, path) : Typr.U._compoGlyph(gl, font, path));
	}, Typr.U._simpleGlyph = function(gl, p) {
		for (var c = 0; c < gl.noc; c++) {
			for (var i0 = 0 == c ? 0 : gl.endPts[c - 1] + 1, il = gl.endPts[c], i = i0; i <= il; i++) {
				var pr = i == i0 ? il : i - 1, nx = i == il ? i0 : i + 1, onCurve = 1 & gl.flags[i], prOnCurve = 1 & gl.flags[pr], nxOnCurve = 1 & gl.flags[nx], x = gl.xs[i], y = gl.ys[i];
				if (i == i0) if (onCurve) {
					if (!prOnCurve) {
						Typr.U.P.moveTo(p, x, y);
						continue;
					}
					Typr.U.P.moveTo(p, gl.xs[pr], gl.ys[pr]);
				} else prOnCurve ? Typr.U.P.moveTo(p, gl.xs[pr], gl.ys[pr]) : Typr.U.P.moveTo(p, (gl.xs[pr] + x) / 2, (gl.ys[pr] + y) / 2);
				onCurve ? prOnCurve && Typr.U.P.lineTo(p, x, y) : nxOnCurve ? Typr.U.P.qcurveTo(p, x, y, gl.xs[nx], gl.ys[nx]) : Typr.U.P.qcurveTo(p, x, y, (x + gl.xs[nx]) / 2, (y + gl.ys[nx]) / 2);
			}
			Typr.U.P.closePath(p);
		}
	}, Typr.U._compoGlyph = function(gl, font, p) {
		for (var j = 0; j < gl.parts.length; j++) {
			var path = {
				cmds: [],
				crds: []
			}, prt = gl.parts[j];
			Typr.U._drawGlyf(prt.glyphIndex, font, path);
			for (var m = prt.m, i = 0; i < path.crds.length; i += 2) {
				var x = path.crds[i], y = path.crds[i + 1];
				p.crds.push(x * m.a + y * m.b + m.tx), p.crds.push(x * m.c + y * m.d + m.ty);
			}
			for (i = 0; i < path.cmds.length; i++) p.cmds.push(path.cmds[i]);
		}
	}, Typr.U._getGlyphClass = function(g, cd) {
		var intr = Typr._lctf.getInterval(cd, g);
		return -1 == intr ? 0 : cd[intr + 2];
	}, Typr.U.getPairAdjustment = function(font, g1, g2) {
		if (font.GPOS) {
			for (var ltab = null, i = 0; i < font.GPOS.featureList.length; i++) {
				var fl = font.GPOS.featureList[i];
				if ("kern" == fl.tag) for (var j = 0; j < fl.tab.length; j++) 2 == font.GPOS.lookupList[fl.tab[j]].ltype && (ltab = font.GPOS.lookupList[fl.tab[j]]);
			}
			if (ltab) for (i = 0; i < ltab.tabs.length; i++) {
				var tab = ltab.tabs[i], ind = Typr._lctf.coverageIndex(tab.coverage, g1);
				if (-1 != ind) {
					if (1 == tab.format) {
						var right = tab.pairsets[ind];
						for (j = 0; j < right.length; j++) right[j].gid2 == g2 && (adj = right[j]);
						if (null == adj) continue;
					} else if (2 == tab.format) var c1 = Typr.U._getGlyphClass(g1, tab.classDef1), c2 = Typr.U._getGlyphClass(g2, tab.classDef2), adj = tab.matrix[c1][c2];
					return adj.val1[2];
				}
			}
		}
		if (font.kern) {
			var ind1 = font.kern.glyph1.indexOf(g1);
			if (-1 != ind1) {
				var ind2 = font.kern.rval[ind1].glyph2.indexOf(g2);
				if (-1 != ind2) return font.kern.rval[ind1].vals[ind2];
			}
		}
		return 0;
	}, Typr.U.stringToGlyphs = function(font, str) {
		for (var gls = [], i = 0; i < str.length; i++) {
			var cc = str.codePointAt(i);
			cc > 65535 && i++, gls.push(Typr.U.codeToGlyph(font, cc));
		}
		var gsub = font.GSUB;
		if (null == gsub) return gls;
		for (var llist = gsub.lookupList, flist = gsub.featureList, wsep = "\n	\" ,.:;!?()  ،", R = "آأؤإاةدذرزوٱٲٳٵٶٷڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙۀۃۄۅۆۇۈۉۊۋۍۏےۓەۮۯܐܕܖܗܘܙܞܨܪܬܯݍݙݚݛݫݬݱݳݴݸݹࡀࡆࡇࡉࡔࡧࡩࡪࢪࢫࢬࢮࢱࢲࢹૅેૉ૊૎૏ૐ૑૒૝ૡ૤૯஁ஃ஄அஉ஌எஏ஑னப஫஬", ci = 0; ci < gls.length; ci++) {
			var gl = gls[ci], slft = 0 == ci || -1 != wsep.indexOf(str[ci - 1]), srgt = ci == gls.length - 1 || -1 != wsep.indexOf(str[ci + 1]);
			slft || -1 == R.indexOf(str[ci - 1]) || (slft = true), srgt || -1 == R.indexOf(str[ci]) || (srgt = true), srgt || -1 == "ꡲ્૗".indexOf(str[ci + 1]) || (srgt = true), slft || -1 == "ꡲ્૗".indexOf(str[ci]) || (slft = true);
			var feat = null;
			feat = slft ? srgt ? "isol" : "init" : srgt ? "fina" : "medi";
			for (var fi = 0; fi < flist.length; fi++) if (flist[fi].tag == feat) for (var ti = 0; ti < flist[fi].tab.length; ti++) 1 == (tab = llist[flist[fi].tab[ti]]).ltype && Typr.U._applyType1(gls, ci, tab);
		}
		var cligs = [
			"rlig",
			"liga",
			"mset"
		];
		for (ci = 0; ci < gls.length; ci++) {
			gl = gls[ci];
			var rlim = Math.min(3, gls.length - ci - 1);
			for (fi = 0; fi < flist.length; fi++) {
				var fl = flist[fi];
				if (-1 != cligs.indexOf(fl.tag)) {
					for (ti = 0; ti < fl.tab.length; ti++) for (var tab = llist[fl.tab[ti]], j = 0; j < tab.tabs.length; j++) if (null != tab.tabs[j]) {
						var ind = Typr._lctf.coverageIndex(tab.tabs[j].coverage, gl);
						if (-1 != ind) {
							if (4 == tab.ltype) for (var vals = tab.tabs[j].vals[ind], k = 0; k < vals.length; k++) {
								var lig = vals[k], rl = lig.chain.length;
								if (!(rl > rlim)) {
									for (var good = true, l = 0; l < rl; l++) lig.chain[l] != gls[ci + (1 + l)] && (good = false);
									if (good) {
										gls[ci] = lig.nglyph;
										for (l = 0; l < rl; l++) gls[ci + l + 1] = -1;
									}
								}
							}
							else if (5 == tab.ltype) {
								var ltab = tab.tabs[j];
								if (2 != ltab.fmt) continue;
								var cind = Typr._lctf.getInterval(ltab.cDef, gl), cls = ltab.cDef[cind + 2], scs = ltab.scset[cls];
								for (i = 0; i < scs.length; i++) {
									var sc = scs[i], inp = sc.input;
									if (!(inp.length > rlim)) {
										for (good = true, l = 0; l < inp.length; l++) {
											var cind2 = Typr._lctf.getInterval(ltab.cDef, gls[ci + 1 + l]);
											if (-1 == cind && ltab.cDef[cind2 + 2] != inp[l]) {
												good = false;
												break;
											}
										}
										if (good) {
											var lrs = sc.substLookupRecords;
											for (k = 0; k < lrs.length; k += 2) lrs[k], lrs[k + 1];
										}
									}
								}
							}
						}
					}
				}
			}
		}
		return gls;
	}, Typr.U._applyType1 = function(gls, ci, tab) {
		for (var gl = gls[ci], j = 0; j < tab.tabs.length; j++) {
			var ttab = tab.tabs[j], ind = Typr._lctf.coverageIndex(ttab.coverage, gl);
			-1 != ind && (1 == ttab.fmt ? gls[ci] = gls[ci] + ttab.delta : gls[ci] = ttab.newg[ind]);
		}
	}, Typr.U.glyphsToPath = function(font, gls, clr) {
		for (var tpath = {
			cmds: [],
			crds: []
		}, x = 0, i = 0; i < gls.length; i++) {
			var gid = gls[i];
			if (-1 != gid) {
				for (var gid2 = i < gls.length - 1 && -1 != gls[i + 1] ? gls[i + 1] : 0, path = Typr.U.glyphToPath(font, gid), j = 0; j < path.crds.length; j += 2) tpath.crds.push(path.crds[j] + x), tpath.crds.push(path.crds[j + 1]);
				clr && tpath.cmds.push(clr);
				for (j = 0; j < path.cmds.length; j++) tpath.cmds.push(path.cmds[j]);
				clr && tpath.cmds.push("X"), x += font.hmtx.aWidth[gid], i < gls.length - 1 && (x += Typr.U.getPairAdjustment(font, gid, gid2));
			}
		}
		return tpath;
	}, Typr.U.pathToSVG = function(path, prec) {
		prec ?? (prec = 5);
		for (var out = [], co = 0, lmap = {
			M: 2,
			L: 2,
			Q: 4,
			C: 6
		}, i = 0; i < path.cmds.length; i++) {
			var cmd = path.cmds[i], cn = co + (lmap[cmd] ? lmap[cmd] : 0);
			for (out.push(cmd); co < cn;) {
				var c = path.crds[co++];
				out.push(parseFloat(c.toFixed(prec)) + (co == cn ? "" : " "));
			}
		}
		return out.join("");
	}, Typr.U.pathToContext = function(path, ctx) {
		for (var c = 0, crds = path.crds, j = 0; j < path.cmds.length; j++) {
			var cmd = path.cmds[j];
			"M" == cmd ? (ctx.moveTo(crds[c], crds[c + 1]), c += 2) : "L" == cmd ? (ctx.lineTo(crds[c], crds[c + 1]), c += 2) : "C" == cmd ? (ctx.bezierCurveTo(crds[c], crds[c + 1], crds[c + 2], crds[c + 3], crds[c + 4], crds[c + 5]), c += 6) : "Q" == cmd ? (ctx.quadraticCurveTo(crds[c], crds[c + 1], crds[c + 2], crds[c + 3]), c += 4) : "#" == cmd.charAt(0) ? (ctx.beginPath(), ctx.fillStyle = cmd) : "Z" == cmd ? ctx.closePath() : "X" == cmd && ctx.fill();
		}
	}, Typr.U.P = {}, Typr.U.P.moveTo = function(p, x, y) {
		p.cmds.push("M"), p.crds.push(x, y);
	}, Typr.U.P.lineTo = function(p, x, y) {
		p.cmds.push("L"), p.crds.push(x, y);
	}, Typr.U.P.curveTo = function(p, a, b, c, d, e, f) {
		p.cmds.push("C"), p.crds.push(a, b, c, d, e, f);
	}, Typr.U.P.qcurveTo = function(p, a, b, c, d) {
		p.cmds.push("Q"), p.crds.push(a, b, c, d);
	}, Typr.U.P.closePath = function(p) {
		p.cmds.push("Z");
	}, Typr.U._drawCFF = function(cmds, state, font, p) {
		for (var stack = state.stack, nStems = state.nStems, haveWidth = state.haveWidth, width = state.width, open = state.open, i = 0, x = state.x, y = state.y, c1x = 0, c1y = 0, c2x = 0, c2y = 0, c3x = 0, c3y = 0, c4x = 0, c4y = 0, jpx = 0, jpy = 0, o = {
			val: 0,
			size: 0
		}; i < cmds.length;) {
			Typr.CFF.getCharString(cmds, i, o);
			var v = o.val;
			if (i += o.size, "o1" == v || "o18" == v) stack.length % 2 != 0 && !haveWidth && (width = stack.shift() + font.Private.nominalWidthX), nStems += stack.length >> 1, stack.length = 0, haveWidth = true;
			else if ("o3" == v || "o23" == v) stack.length % 2 != 0 && !haveWidth && (width = stack.shift() + font.Private.nominalWidthX), nStems += stack.length >> 1, stack.length = 0, haveWidth = true;
			else if ("o4" == v) stack.length > 1 && !haveWidth && (width = stack.shift() + font.Private.nominalWidthX, haveWidth = true), open && Typr.U.P.closePath(p), y += stack.pop(), Typr.U.P.moveTo(p, x, y), open = true;
			else if ("o5" == v) for (; stack.length > 0;) x += stack.shift(), y += stack.shift(), Typr.U.P.lineTo(p, x, y);
			else if ("o6" == v || "o7" == v) for (var count = stack.length, isX = "o6" == v, j = 0; j < count; j++) {
				var sval = stack.shift();
				isX ? x += sval : y += sval, isX = !isX, Typr.U.P.lineTo(p, x, y);
			}
			else if ("o8" == v || "o24" == v) {
				count = stack.length;
				for (var index = 0; index + 6 <= count;) c1x = x + stack.shift(), c1y = y + stack.shift(), c2x = c1x + stack.shift(), c2y = c1y + stack.shift(), x = c2x + stack.shift(), y = c2y + stack.shift(), Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y), index += 6;
				"o24" == v && (x += stack.shift(), y += stack.shift(), Typr.U.P.lineTo(p, x, y));
			} else {
				if ("o11" == v) break;
				if ("o1234" == v || "o1235" == v || "o1236" == v || "o1237" == v) "o1234" == v && (c1y = y, c2x = (c1x = x + stack.shift()) + stack.shift(), jpy = c2y = c1y + stack.shift(), c3y = c2y, c4y = y, x = (c4x = (c3x = (jpx = c2x + stack.shift()) + stack.shift()) + stack.shift()) + stack.shift(), Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy), Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y)), "o1235" == v && (c1x = x + stack.shift(), c1y = y + stack.shift(), c2x = c1x + stack.shift(), c2y = c1y + stack.shift(), jpx = c2x + stack.shift(), jpy = c2y + stack.shift(), c3x = jpx + stack.shift(), c3y = jpy + stack.shift(), c4x = c3x + stack.shift(), c4y = c3y + stack.shift(), x = c4x + stack.shift(), y = c4y + stack.shift(), stack.shift(), Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy), Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y)), "o1236" == v && (c1x = x + stack.shift(), c1y = y + stack.shift(), c2x = c1x + stack.shift(), jpy = c2y = c1y + stack.shift(), c3y = c2y, c4x = (c3x = (jpx = c2x + stack.shift()) + stack.shift()) + stack.shift(), c4y = c3y + stack.shift(), x = c4x + stack.shift(), Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy), Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y)), "o1237" == v && (c1x = x + stack.shift(), c1y = y + stack.shift(), c2x = c1x + stack.shift(), c2y = c1y + stack.shift(), jpx = c2x + stack.shift(), jpy = c2y + stack.shift(), c3x = jpx + stack.shift(), c3y = jpy + stack.shift(), c4x = c3x + stack.shift(), c4y = c3y + stack.shift(), Math.abs(c4x - x) > Math.abs(c4y - y) ? x = c4x + stack.shift() : y = c4y + stack.shift(), Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy), Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y));
				else if ("o14" == v) {
					if (stack.length > 0 && !haveWidth && (width = stack.shift() + font.nominalWidthX, haveWidth = true), 4 == stack.length) {
						var adx = stack.shift(), ady = stack.shift(), bchar = stack.shift(), achar = stack.shift(), bind = Typr.CFF.glyphBySE(font, bchar), aind = Typr.CFF.glyphBySE(font, achar);
						Typr.U._drawCFF(font.CharStrings[bind], state, font, p), state.x = adx, state.y = ady, Typr.U._drawCFF(font.CharStrings[aind], state, font, p);
					}
					open && (Typr.U.P.closePath(p), open = false);
				} else if ("o19" == v || "o20" == v) stack.length % 2 != 0 && !haveWidth && (width = stack.shift() + font.Private.nominalWidthX), nStems += stack.length >> 1, stack.length = 0, haveWidth = true, i += nStems + 7 >> 3;
				else if ("o21" == v) stack.length > 2 && !haveWidth && (width = stack.shift() + font.Private.nominalWidthX, haveWidth = true), y += stack.pop(), x += stack.pop(), open && Typr.U.P.closePath(p), Typr.U.P.moveTo(p, x, y), open = true;
				else if ("o22" == v) stack.length > 1 && !haveWidth && (width = stack.shift() + font.Private.nominalWidthX, haveWidth = true), x += stack.pop(), open && Typr.U.P.closePath(p), Typr.U.P.moveTo(p, x, y), open = true;
				else if ("o25" == v) {
					for (; stack.length > 6;) x += stack.shift(), y += stack.shift(), Typr.U.P.lineTo(p, x, y);
					c1x = x + stack.shift(), c1y = y + stack.shift(), c2x = c1x + stack.shift(), c2y = c1y + stack.shift(), x = c2x + stack.shift(), y = c2y + stack.shift(), Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
				} else if ("o26" == v) for (stack.length % 2 && (x += stack.shift()); stack.length > 0;) c1x = x, c1y = y + stack.shift(), x = c2x = c1x + stack.shift(), y = (c2y = c1y + stack.shift()) + stack.shift(), Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
				else if ("o27" == v) for (stack.length % 2 && (y += stack.shift()); stack.length > 0;) c1y = y, c2x = (c1x = x + stack.shift()) + stack.shift(), c2y = c1y + stack.shift(), x = c2x + stack.shift(), y = c2y, Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
				else if ("o10" == v || "o29" == v) {
					var obj = "o10" == v ? font.Private : font;
					if (0 == stack.length) console.log("error: empty stack");
					else {
						var ind = stack.pop(), subr = obj.Subrs[ind + obj.Bias];
						state.x = x, state.y = y, state.nStems = nStems, state.haveWidth = haveWidth, state.width = width, state.open = open, Typr.U._drawCFF(subr, state, font, p), x = state.x, y = state.y, nStems = state.nStems, haveWidth = state.haveWidth, width = state.width, open = state.open;
					}
				} else if ("o30" == v || "o31" == v) {
					var count1 = stack.length, alternate = (index = 0, "o31" == v);
					for (index += count1 - (count = -3 & count1); index < count;) alternate ? (c1y = y, c2x = (c1x = x + stack.shift()) + stack.shift(), y = (c2y = c1y + stack.shift()) + stack.shift(), count - index == 5 ? (x = c2x + stack.shift(), index++) : x = c2x, alternate = false) : (c1x = x, c1y = y + stack.shift(), c2x = c1x + stack.shift(), c2y = c1y + stack.shift(), x = c2x + stack.shift(), count - index == 5 ? (y = c2y + stack.shift(), index++) : y = c2y, alternate = true), Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y), index += 4;
				} else {
					if ("o" == (v + "").charAt(0)) throw console.log("Unknown operation: " + v, cmds), v;
					stack.push(v);
				}
			}
		}
		state.x = x, state.y = y, state.nStems = nStems, state.haveWidth = haveWidth, state.width = width, state.open = open;
	};
	var typr_default = getDefaultExportFromCjs(Typr);
	var decode = (iframeWindow) => {
		var _a;
		const styleElements = iframeWindow.document.querySelectorAll("style");
		let tipElement = null;
		if (styleElements.forEach((styleElement) => {
			var _a2;
			-1 !== ((_a2 = styleElement.textContent) == null ? void 0 : _a2.indexOf("font-cxsecret")) && (tipElement = styleElement);
		}), !tipElement) return;
		const fontMatch = (_a = tipElement.textContent) == null ? void 0 : _a.match(/base64,([\w\W]+?)'/);
		if (!fontMatch) return;
		const fontData = ((base64) => {
			const decodedData = atob(base64), array = new Uint8Array(decodedData.length);
			for (let i = 0; i < decodedData.length; i++) array[i] = decodedData.charCodeAt(i);
			return array;
		})(fontMatch[1]), font = typr_default.parse(fontData), table = JSON.parse(_GM_getResourceText("ttf"));
		let text = {};
		for (let i = 19968; i < 40870; i++) {
			let t = typr_default.U.codeToGlyph(font, i);
			t && (t = typr_default.U.glyphToPath(font, t), t = (0, blueimp_md5.default)(JSON.stringify(t)).slice(24), text[i] = table[t]);
		}
		iframeWindow.document.querySelectorAll(".font-cxsecret").forEach((fontElement) => {
			let html = fontElement.innerHTML;
			Object.keys(text).forEach((key) => {
				const regex = new RegExp(String.fromCharCode(key), "g");
				html = html.replace(regex, String.fromCharCode(text[key]));
			}), fontElement.innerHTML = html, fontElement.classList.remove("font-cxsecret");
		});
	};
	
	async function getAnswerAI(questionData) {
		const config = getConfig();
		if (!config.gpt) return null;
	var rawKey = (config.gptKey || "").trim();
	if (!rawKey) { console.warn("[AI] 未填写 API Key，跳过 AI 兜底"); return null; }
	config.gptKey = rawKey;
		
		try {
			const baseURL = config.gptBaseURL || "https://api.deepseek.com/v1";
			const model = config.gptModel || "deepseek-chat";
			var normalizedBase = (baseURL || "").replace(/\/+$/, "");
			if (!/\/chat\/completions$/.test(normalizedBase)) normalizedBase += "/chat/completions";
			
			let systemPrompt = "你是一个学习助手，请根据题目给出准确答案。";
			if (questionData.type === "4" || questionData.type === "5" || questionData.type === "6") {
				systemPrompt = "你是一个学习助手，请根据题目给出简洁准确的简答题答案，不要多余解释。";
			}
			if (questionData.type === "2") {
				systemPrompt = "你是一个学习助手，请根据填空题给出准确答案。如果有多个空，请按'第一空：答案\\n第二空：答案\\n第三空：答案...'的格式返回，不要多余解释。";
			}
			if (questionData.type === "3") {
				systemPrompt = "你是一个学习助手，请根据判断题给出准确答案。只需要回答'正确'或'错误'，不要多余解释。";
			}
			if (questionData.type === "1") {
				systemPrompt = "你是一个学习助手，请根据多选题给出准确答案。请列出所有正确选项的字母，比如'ABD'，不要多余解释。";
			}
			if (questionData.type === "0") {
				systemPrompt = "你是一个学习助手，请根据单选题给出准确答案。请列出正确选项的字母，比如'A'，不要多余解释。";
			}
			
			const response = await new Promise((resolve, reject) => {
				_GM_xmlhttpRequest({
					method: "POST",
					url: normalizedBase,
					headers: {
						"Content-Type": "application/json",
						"Authorization": "Bearer " + config.gptKey
					},
					data: JSON.stringify({
						model: model,
						messages: [
							{ role: "system", content: systemPrompt },
							{ role: "user", content: questionData.question }
						],
						temperature: 0.3,
						max_tokens: 1000
					}),
					timeout: 30000,
					onload: (res) => resolve(res),
					onerror: (err) => reject(err),
					ontimeout: () => reject("timeout")
				});
			});
			
			const httpStatus = response.status || 0;
			if (httpStatus && httpStatus !== 200) {
				console.error("[AI] 接口返回异常状态:", httpStatus, (response.responseText || "").slice(0, 300));
				return null;
			}
			const data = JSON.parse(response.responseText);
			if (data.choices && data.choices[0] && data.choices[0].message) {
				let answer = data.choices[0].message.content.trim();
				console.log("AI原始回答:", answer);
				
				// 如果是选择题，提取选项
				if (questionData.type === "0" || questionData.type === "1") {
					if (questionData.options) {
						let matchedOptions = [];
						
						// 1. 先尝试匹配所有选项文本
						for (let i = 0; i < questionData.options.length; i++) {
							if (answer.includes(questionData.options[i])) {
								matchedOptions.push(questionData.options[i]);
								console.log("AI匹配到选项文本:", questionData.options[i]);
							}
						}
						
						// 2. 如果文本匹配没找到，尝试数字智能匹配
						if (matchedOptions.length === 0) {
							const answerNumbers = answer.match(/\d+\.?\d*/g);
							if (answerNumbers) {
								console.log("AI回答中的数字:", answerNumbers);
								for (let i = 0; i < questionData.options.length; i++) {
									const optionNumbers = questionData.options[i].match(/\d+\.?\d*/g);
									if (optionNumbers) {
										for (let j = 0; j < answerNumbers.length; j++) {
											for (let k = 0; k < optionNumbers.length; k++) {
												if (parseFloat(answerNumbers[j]) === parseFloat(optionNumbers[k])) {
													if (!matchedOptions.includes(questionData.options[i])) {
														matchedOptions.push(questionData.options[i]);
														console.log("AI数字匹配成功:", answerNumbers[j], "==", optionNumbers[k], "->", questionData.options[i]);
													}
												}
											}
										}
									}
								}
							}
						}
						
						// 3. 再尝试匹配A/B/C/D字母（支持多选，如"ABD"）
						if (matchedOptions.length === 0) {
							let letterMatch = answer.match(/答案[是为:：]?\s*\**([A-Da-d]+)\**/);
					if (!letterMatch) letterMatch = answer.match(/(?:^|[\s,，、:：;；])([A-Da-d]{1,4})(?=[\s,，、。.;；]|$)/);
							if (letterMatch) {
								const letters = letterMatch[1].toUpperCase().split("");
								for (let i = 0; i < letters.length; i++) {
									const index = letters[i].charCodeAt(0) - 65;
									if (index >= 0 && index < questionData.options.length) {
										matchedOptions.push(questionData.options[index]);
										console.log("AI匹配到字母:", letters[i], "->", questionData.options[index]);
									}
								}
							}
						}
						
						// 单选题只取第一个，多选题返回所有
						if (matchedOptions.length > 0) {
							if (questionData.type === "0" && matchedOptions.length > 1) {
								console.log("单选题匹配到多个，只取第一个:", matchedOptions[0]);
								return [matchedOptions[0]];
							}
							console.log("选择题最终匹配:", matchedOptions);
							return matchedOptions;
						}
					}
				}
				// 填空题：解析"第一空：xxx\n第二空：xxx"格式
				if (questionData.type === "2") {
					var fillAnswers = null;
					var fillMatch = answer.match(/第[一二三四五六七八九十\d]+空[：:]\s*(.*?)(?=\n第[一二三四五六七八九十\d]+空[：:]|$)/g);
					if (fillMatch && fillMatch.length > 1) {
						fillAnswers = fillMatch.map(function(m){ return m.replace(/^第[一二三四五六七八九十\d]+空[：:]\s*/, "").trim(); });
					} else {
						var lines = answer.split(/\n+/).map(function(s){ return s.trim(); }).filter(Boolean);
						var numbered = lines.map(function(s){ return s.replace(/^\s*\d+\s*[.、．]\s*/, "").replace(/^空\s*\d+\s*[：:、]?\s*/, "").trim(); }).filter(Boolean);
						if (numbered.length >= 2) fillAnswers = numbered;
					}
					if (fillAnswers && fillAnswers.length > 1) {
						console.log("AI填空题拆分:", fillAnswers);
						return fillAnswers;
					}
				}
				return answer;
			}
			return null;
		} catch (e) {
			console.error("AI答题失败:", e);
			return null;
		}
	}

var getAnswers = (questionData, windowz = _unsafeWindow) => {
		let server = new ServerApi(windowz);
		const config = getConfig();
		const promises = [
			server.getAnswer(questionData),
			server.getAnswer2(questionData),
			server.getAnswer4(questionData)
		];
		const aiPromise = getAnswerAI(questionData).then(answer => {
			if (answer) {
				return {
					form: config.gptService || "AI",
					answer: Array.isArray(answer) ? answer : [answer]
				};
			}
			return { form: "AI", answer: [] };
		}).catch(() => ({ form: "AI", answer: [] }));
		promises.push(aiPromise);
		return Promise.all(promises);
	};
	var sanitizeAnswerText = function(text) {
		if (text == null) return "";
		var s = String(text);
		s = s.replace(/<script[\s\S]*?<\/script>/gi, "");
		s = s.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
		s = s.replace(/javascript\s*:/gi, "");
		s = s.replace(/<[^>]+>/g, "");
		return s.trim();
	};
	var fillAnswer = (answer, questionData, html, iframeWindow) => {
		answer = answer.filter((item) => item.answer.length > 0), console.log(answer);
		for (let i = 0; i < answer.length; i++) {
			if ("string" == typeof answer[i].answer) {
				if (-1 !== answer[i].answer.indexOf("付费题库") || -1 !== answer[i].answer.indexOf("暂无答案") || "略" == answer[i].answer) continue;
				answer[i].answer = [answer[i].answer];
			}
			let tmp = setAnswer(answer[i].answer, questionData, html, iframeWindow);
			if (tmp) return tmp;
		}
		return false;
	};
	var setAnswer = (answer, questionData, html, iframeWindow) => {
		switch (questionData.type) {
			case "0":
			case "1":
				const matchArr = matchAnswer(answer, questionData.options);
				matchArr.length > 0 && clearCurrent(html, iframeWindow);
				for (var i = 0; i < matchArr.length; i++) console.log((0, jquery.default)(html).find("li").eq(matchArr[i]), matchArr[i]), (0, jquery.default)(html).find("ul:eq(0) li :radio,:checkbox,textarea").eq(matchArr[i]).click(), (0, jquery.default)(html).find(".answerBg").eq(matchArr[i]).click(), (0, jquery.default)(html).find("li").eq(matchArr[i]).click();
				return matchArr.length > 0 && answer;
			case "3": return clearCurrent(html, iframeWindow), answer instanceof Array && (answer = answer[0]), (0, jquery.default)(html).find("ul:eq(0) li :radio,:checkbox,textarea").each(function() {
				"true" == (0, jquery.default)(this).val() ? answer.match(/(^|,)(True|true|正确|对|√)(,|$)/) && (0, jquery.default)(this).click() : answer.match(/(^|,)(False|false|错误|错|×)(,|$)/) && (0, jquery.default)(this).click();
			}), (0, jquery.default)(html).find(".answerBg").each(function() {
				"true" == (0, jquery.default)(this).find(".num_option").attr("data") ? answer.match(/(^|,)(True|true|正确|对|√)(,|$)/) && (0, jquery.default)(this).click() : answer.match(/(^|,)(False|false|错误|错|×)(,|$)/) && (0, jquery.default)(this).click();
			}), !!((0, jquery.default)(html).find("ul:eq(0) li :radio,:checkbox,textarea").is(":checked") || (0, jquery.default)(html).find(".check_answer").length > 0 || (0, jquery.default)(html).find(".check_answer_dx").length > 0) && answer;
			case "2":
			case "9":
			case "4":
			case "5":
			case "6":
			case "7": return (0, jquery.default)(html).find("textarea").length == answer.length && (clearCurrent(html, iframeWindow), (0, jquery.default)(html).find("textarea").each(function(index) {
				iframeWindow.UE.getEditor((0, jquery.default)(this).attr("name")).ready(function() {
					this.setContent(sanitizeAnswerText(answer[index].replace(/第[一二三四五六七八九十\d]*空[：:]?/g, "")));
				});
			}), answer);
			default: return false;
		}
	};
	var matchAnswer = (answer, options) => {
		answer = ((answer2) => {
			if (answer2 instanceof Array) {
				answer2 = answer2.filter(function(item) {
					return null !== item;
				});
				for (let i2 = 0; i2 < answer2.length; i2++) answer2[i2] = removeHtml(answer2[i2]);
			} else "string" == typeof answer2 && (answer2 = cl(answer2));
			return answer2;
		})(answer);
		for (var matchArr = [], i = 0; i < answer.length; i++) for (var j = 0; j < options.length; j++) answer[i] == options[j] && matchArr.push(j);
		return matchArr;
	};
	var clearCurrent = (item, iframeWindow) => {
		(0, jquery.default)(item).find(".answerBg, .textDIV, .eidtDiv").each(function() {
			((0, jquery.default)(this).find(".check_answer").length || (0, jquery.default)(this).find(".check_answer_dx").length) && (0, jquery.default)(this).click();
		}), (0, jquery.default)(item).find("textarea").each(function() {
			iframeWindow.UE.getEditor((0, jquery.default)(this).attr("name")).ready(function() {
				this.setContent("");
			});
		}), (0, jquery.default)(item).find(":radio, :checkbox").prop("checked", false), (0, jquery.default)(item).find("textarea").each(function() {
			iframeWindow.UE.getEditor((0, jquery.default)(this).attr("name")).ready(function() {
				this.setContent("");
			});
		});
	};
	var Cx = class {
		constructor() {
			const { app, askStore } = mountTaskApp();
			this.app = app;
			this.askStore = askStore;
			this.ServerApi = new ServerApi();
			this.defaultConfig = getConfig();
		}
		innerbook() {}
		async audio(iframeWindow) {
			this.askStore.reset(), this.askStore.task.name = "视频音频";
			const audio = iframeWindow.document.getElementById("audio_html5_api");
			return audio.muted = true, audio.autoplay = true, audio.volume = 0, audio.play().then(function() {
				console.log("播放成功");
			}).catch(function(error) {
				"NotAllowedError" === error.name ? element_plus.ElMessageBox.alert("由于自动播放需要用户点击过浏览器，请确认即可", "温馨提示", {
					confirmButtonText: "确认",
					callback: () => {
						audio.play();
					}
				}) : console.error("视频播放失败，原因：", error);
			}), new Promise((resolve) => {
				const intervalId = setInterval(() => {
					audio.ended ? (clearInterval(intervalId), log("监听到音频已完成", "success"), resolve()) : audio.paused && audio.play();
				}, 1e3);
				audio.addEventListener("ended", function() {
					log("监听到音频已完成1", "success"), audio.pause(), clearInterval(intervalId), resolve();
				});
			});
		}
		async video(iframeWindow) {
			this.askStore.reset(), this.askStore.task.name = "视频", this.askStore.task.video.status = 1, await waitElementLoaded(iframeWindow, "#video_html5_api"), console.log("视频加载完成");
			const player = iframeWindow.videojs("video_html5_api"), playerButton = iframeWindow.document.querySelector(".vjs-big-play-button");
			player.muted(true), player.playbackRate(2), player.play(), await new Promise((resolve) => {
				const intervalId = setInterval(() => {
					"isUnFinishJob" in iframeWindow && iframeWindow.isUnFinishJob() ? player.paused() && playerButton?.click() : (clearInterval(intervalId), resolve());
				}, 1e3), pauseBase = player.pause;
				player.pause = function() {
					player.currentTime() >= player.duration() && (console.log("视频播放完成"), player.pause = pauseBase, resolve());
				}, player.on("ended", () => {
					console.log("视频播放完成1"), player.pause = pauseBase, player.pause(), clearInterval(intervalId), resolve();
				});
			}), console.log("任务点完成");
		}
		work(iframeWindow) {
			return new Promise(async (resolve) => {
				decode(iframeWindow);
				const Timu = iframeWindow.document.querySelectorAll(".TiMu");
				if (!Timu) return void resolve();
				let ques = [], succ = 0;
				for (let i = 0; i < Timu.length; i++) {
					let data = getQuestion("1", Timu[i]);
					console.log(data), ques.push(data);
				}
				this.askStore.reset(), this.askStore.count = ques.length, this.askStore.task.name = "章节测验";
				for (let i = 0; i < ques.length; i++) {
					this.defaultConfig = getConfig(); await sleep(this.defaultConfig.answerInterval), this.askStore.insert(ques[i]), this.askStore.task.work.inx = i;
					let data = await getAnswers(ques[i], iframeWindow);
					this.askStore.get(i).allAnswer = data;
					let tmp = fillAnswer(data, ques[i], Timu[i], iframeWindow);
					tmp ? (this.askStore.get(i).status = "primary", this.askStore.get(i).answer = tmp, succ++) : (this.askStore.get(i).status = "danger", this.askStore.get(i).answer = "暂无答案"), this.askStore.get(i).dom = Timu[i];
				}
				this.defaultConfig.autoSubmit ? (succ / ques.length < this.defaultConfig.minAccuracy ? (this.askStore.log("章节测验正确率不足，暂存", "error"), iframeWindow.alert = function(e) {
					console.log("alert 方法被阻止", e);
				}, iframeWindow.noSubmit()) : (iframeWindow.btnBlueSubmit(), await sleep(3), iframeWindow.submitCheckTimes(), this.askStore.log("章节测验已完成", "success")), this.askStore.task.status = `章节测验已完成，等待切换,正确率:${succ}/${ques.length}`, resolve()) : (this.askStore.log("已完成答题，未开启自动提交，等待手动提交中", "success"), this.askStore.task.status = `正在等待手动提交,正确率:${succ}/${ques.length}`);
			});
		}
		homework() {
			return new Promise(async (resolve) => {
				const Timu = _unsafeWindow.document.querySelectorAll(".questionLi");
				if (!Timu) return void resolve();
				let ques = [];
				for (let i = 0; i < Timu.length; i++) {
					let data = getQuestion("2", Timu[i]);
					ques.push(data);
				}
				this.askStore.reset(), this.askStore.count = ques.length, this.askStore.task.name = "作业";
				for (let i = 0; i < ques.length; i++) {
					this.defaultConfig = getConfig(); await sleep(this.defaultConfig.answerInterval), this.askStore.insert(ques[i]), this.askStore.task.work.inx = i;
					let data = await getAnswers(ques[i]);
					this.askStore.get(i).allAnswer = data;
					let tmp = fillAnswer(data, ques[i], Timu[i], _unsafeWindow);
					tmp ? (this.askStore.get(i).status = "primary", this.askStore.get(i).answer = tmp) : (this.askStore.get(i).status = "danger", this.askStore.get(i).answer = "暂无答案"), this.askStore.get(i).dom = Timu[i];
				}
			});
		}
		exam() {
			return new Promise(async (resolve) => {
				this.askStore.reset(), this.askStore.count = 1, this.askStore.task.name = "考试";
				let data = getQuestion("3", _unsafeWindow.document.body);
				this.askStore.insert(data), this.askStore.task.work.inx = 0;
				let data1 = await getAnswers(data);
				this.askStore.get(0).allAnswer = data1;
				let tmp = fillAnswer(data1, data, document.getElementsByClassName("mark_table")[0], _unsafeWindow);
				if (tmp ? (this.askStore.get(0).status = "primary", this.askStore.get(0).answer = tmp) : (this.askStore.get(0).status = "danger", this.askStore.get(0).answer = "暂无答案"), this.defaultConfig.autoExam) {
					await sleep(this.defaultConfig.answerInterval);
					const nextButton = (0, jquery.default)(".nextDiv .jb_btn:contains(\"下一题\")");
					nextButton ? nextButton.click() : (this.askStore.log("已完成答题，请自行检查答案填写后自行提交", "success"), this.askStore.task.status = "已完成答题，请自行检查答案填写后自行提交");
				} else this.askStore.task.status = "未开启自动切换，等待手动切换";
			});
		}
		pdf(iframeWindow) {
			return new Promise(async (resolve) => {
				const contentWindow = iframeWindow.document.querySelector("#panView").contentWindow;
				contentWindow.scrollTo(0, contentWindow.document.body.scrollHeight), resolve();
			});
		}
		async s(iframeWindow) {
			const questionList = (0, jquery.default)(iframeWindow.document).find(".TiMu").map(function(index, element) {
				try {
					let questionHtml, questionText, questionType$1, questionAnswer, questionOption = [];
					switch (questionHtml = (0, jquery.default)(element).find(".Zy_TItle .clearfix"), questionText = removeHtml(questionHtml[0].innerHTML), questionType$1 = questionText.match(/^\【(.+?)\】/)[1], questionText = questionText.replace(questionText.match(/^\【(.+?)\】/)[0], ""), questionType$1) {
						case "单选题":
						case "多选题": return questionOption = (0, jquery.default)(element).find("ul>li").map(function(inx, item) {
							return removeHtml((0, jquery.default)(item).find("a").html());
						}).get(), null;
						case "判断题":
							if (removeHtml((0, jquery.default)(element).find(".Py_addpy:eq(0)").html() || ""), element.innerHTML.includes("正确答案")) questionAnswer = removeHtml((0, jquery.default)(element).find(".Py_answer.clearfix>span").html());
							else {
								const match = (0, jquery.default)(element).find(".Py_answer.clearfix").html().match(/^(.*?)(?=<i class="fr (dui|cuo)"><\/i>)/s);
								questionAnswer = removeHtml(match ? match[1] : "");
							}
							if (questionAnswer.includes("正确答案")) questionAnswer = questionAnswer.replace("正确答案：", "").trim();
							else if ((0, jquery.default)(element).find(".fr.dui").length > 0) questionAnswer = questionAnswer.replace("我的答案：", "").trim();
							else {
								if (!questionAnswer.replace("我的答案：", "").trim().includes("√") && !questionAnswer.replace("我的答案：", "").trim().includes("×")) return null;
								questionAnswer = "√" == questionAnswer.replace("我的答案：", "").trim() ? "×" : "√";
							}
							break;
						case "填空题":
							if (questionAnswer = (0, jquery.default)("span.font14", (0, jquery.default)(element)).map(function(inx, item) {
								return removeHtml((0, jquery.default)(item).html()).replace(/^第.空：/, "").trim();
							}).get(), 0 == questionAnswer.length) {
								if (questionAnswer = (0, jquery.default)(element).find(".Py_answer.clearfix>div>div[class='font14']"), !(questionAnswer.length = (0, jquery.default)(element).find(".Py_answer.clearfix>div>div[class='font14']>>.fr.dui").length)) return null;
								questionAnswer = questionAnswer.map(function(inx, item) {
									return removeHtml((0, jquery.default)(item).html()).replace(/^第.空：/, "").trim();
								}).get();
							}
							break;
						default: return null;
					}
					return {
						question: questionText,
						options: questionOption,
						type: questionType[questionType$1],
						answer: questionAnswer
					};
				} catch {
					return null;
				}
			}).get();
			await this.ServerApi.s(questionList, iframeWindow.location.href);
		}
	};
	async function start(formStore) {
		const _self = _unsafeWindow, top = _self.top;
		let iframeCom = null;
		switch (_self.location.pathname) {
			case "/work/doHomeWorkNew":
			case "/mooc-ans/work/doHomeWorkNew":
			case "/mooc2-ans/work/doHomeWorkNew":
				location.href.includes("mooc2=1") && (location.href = location.href.replace(/&mooc2=1/g, ""));
				break;
			case "/mycourse/studentstudy":
			case "/mooc-ans/mycourse/studentstudy":
			case "/mooc2-ans/mycourse/studentstudy":
				if (!_self.location.href.match(/mooc2=1/)) {
					element_plus.ElNotification({
						title: "Auto Ask",
						message: "暂不支持旧版章节，尝试切换至新版",
						type: "error"
					}), _self.location.href = _self.location.href + "&mooc2=1";
					break;
				}
				const cxModel = new Cx();
				cxModel.askStore.log("脚本初始化成功！", "success");
				const startWork = async () => {
					var _a, _b, _c, _d, _e;
					await waitElementLoaded(_self, "#iframe");
					const cardsIframe = _self.document.querySelector("#iframe");
					await waitIframeLoaded(cardsIframe);
					const _self1 = cardsIframe.contentWindow;
					top.scroll2Job();
					let jobList = _self1.document.querySelectorAll(".ans-job-icon") || [];
					for (let i = 0; i < jobList.length; i++) {
						const item = jobList[i];
						if ((_a = item.parentElement) == null ? void 0 : _a.classList.contains("ans-job-finished")) {
							const iframe = (_b = item.parentElement) == null ? void 0 : _b.querySelector("iframe");
							if (iframe == null ? void 0 : iframe.src.match(/\/ananas\/modules\/work\/index.html/)) {
								await waitIframeLoaded(iframe), JSON.parse(iframe.getAttribute("data"));
								const workIframe = (_c = iframe.contentWindow) == null ? void 0 : _c.document.querySelector("iframe");
								workIframe && (await waitIframeLoaded(workIframe), cxModel.s(workIframe.contentWindow));
							}
							console.log(iframe.src, "已完成"), cxModel.askStore.log("已完成的任务点,跳过");
						} else {
							const iframe = (_d = item.parentElement) == null ? void 0 : _d.querySelector("iframe");
							await waitIframeLoaded(iframe);
							const otherInfo = JSON.parse(iframe.getAttribute("data"));
							if (cxModel.askStore.log(`正在完成任务:${otherInfo.name || otherInfo.title}`), iframe == null ? void 0 : iframe.src.match(/\/ananas\/modules\/video\/index\.html/)) {
								if (!formStore.forminput.autoVideo) {
									cxModel.askStore.log("视频任务已跳过", "success");
									continue;
								}
								await cxModel.video(iframe.contentWindow), cxModel.askStore.log("视频任务已完成", "success");
							} else if (iframe == null ? void 0 : iframe.src.match(/\/ananas\/modules\/work\/index.html/)) {
								cxModel.askStore.log("即将开始做作业", "info");
								const workIframe = (_e = iframe.contentWindow) == null ? void 0 : _e.document.querySelector("iframe");
								workIframe && (await waitIframeLoaded(workIframe), await cxModel.work(workIframe.contentWindow), cxModel.askStore.log("作业任务已完成", "success"));
							} else if (iframe == null ? void 0 : iframe.src.match(/\/ananas\/modules\/audio\/index.html/)) {
								if (log("音频", "error"), !formStore.forminput.autoVideo) {
									cxModel.askStore.log("音频任务已跳过", "success");
									continue;
								}
								iframe && (await waitIframeLoaded(iframe), await cxModel.audio(iframe.contentWindow), cxModel.askStore.log("音频任务已完成", "success"));
							} else (iframe == null ? void 0 : iframe.src.match(/\/ananas\/modules\/pdf\/index.html/)) ? (log("文档", "error"), iframe && (await waitIframeLoaded(iframe), await cxModel.pdf(iframe.contentWindow), cxModel.askStore.log("pdf任务已完成", "success"))) : (console.log(iframe == null ? void 0 : iframe.src, "未知"), cxModel.askStore.log("未知任务跳过", "success"));
						}
					}
					await sleep(formStore.forminput.interval), !formStore.forminput.autoJump && cxModel.askStore.msg("由于未开启自动切换,请手动切换"), formStore.forminput.autoJump && top?.document.querySelector(".nextChapter").click();
				};
				setInterval(async () => {
					await waitElementLoaded(_self, "#iframe");
					const cardsIframe = _self.document.querySelector("#iframe");
					await waitIframeLoaded(cardsIframe);
					const _self1 = cardsIframe.contentWindow;
					iframeCom != _self1.location.href && (iframeCom = _self1.location.href, cxModel.askStore.reset(), startWork());
				}, 2e3);
				break;
			case "/mooc2-ans/mycourse/stu":
			case "/mooc-ans/mycourse/stu":
			case "/mycourse/stu":
				element_plus.ElNotification({
					title: "Auto Ask",
					message: "此页面无任务，请自行进入章节页面",
					type: "error"
				});
				break;
			case "/work/selectWorkQuestionYiPiYue":
			case "/knowledge/cards": break;
			case "/mooc2/work/dowork":
			case "/mooc-ans/mooc2/work/dowork":
			case "/mooc2-ans/mooc2/work/dowork":
				const cxModel1 = new Cx();
				cxModel1.askStore.log("脚本初始化成功！", "success"), await cxModel1.homework();
				break;
			case "/exam-ans/exam/test/reVersionTestStartNew":
				const cxModel2 = new Cx();
				await cxModel2.exam(), cxModel2.askStore.log("脚本初始化成功！", "success");
		}
	}
	// ===== 更新检查（打开页面立即探测 + 常驻定时轮询；发现新版一键跳转安装页）=====
		const UPDATE_CHECK_URL = "https://cdn.jsdelivr.net/gh/LMCome/xuexitong-ai-assistant@main/xuexitong-ai-assistant.user.js";
		const UPDATE_PROBE_URL = "https://raw.githubusercontent.com/LMCome/xuexitong-ai-assistant/main/xuexitong-ai-assistant.user.js";
		var UPDATE_POLL_INTERVAL = 10 * 60 * 1000;
		function compareScriptVersion(a, b) {
			var pa = String(a).split(".").map(function(x) { return parseInt(x, 10) || 0; });
			var pb = String(b).split(".").map(function(x) { return parseInt(x, 10) || 0; });
			var len = Math.max(pa.length, pb.length);
			for (var i = 0; i < len; i++) {
				var diff = (pa[i] || 0) - (pb[i] || 0);
				if (diff !== 0) return diff;
			}
			return 0;
		}
		function showUpdateTip(remoteVer) {
			try {
				if (document.getElementById("xxai-update-tip")) return;
				var bar = document.createElement("div");
				bar.id = "xxai-update-tip";
				bar.style.cssText = "position:fixed;right:16px;bottom:84px;z-index:2147483001;background:#16856c;color:#fff;padding:9px 15px;border-radius:20px;font-size:12px;box-shadow:0 4px 16px rgba(21,59,39,.28);font-family:-apple-system,Microsoft YaHei,sans-serif;display:flex;align-items:center;gap:8px;";
				var main = document.createElement("span");
				main.textContent = "发现新版本 v" + remoteVer + "，点击安装更新";
				main.style.cssText = "cursor:pointer;";
				main.onclick = function() {
					try { _unsafeWindow.open(UPDATE_CHECK_URL, "_blank"); } catch (e) { window.open(UPDATE_CHECK_URL, "_blank"); }
				};
				var close = document.createElement("span");
				close.textContent = "×";
				close.style.cssText = "opacity:.8;cursor:pointer;padding:0 2px;";
				close.onclick = function() { bar.remove(); };
				bar.appendChild(main);
				bar.appendChild(close);
				document.body.appendChild(bar);
			} catch (e) { console.warn("更新提示渲染失败", e); }
		}
		function probeUpdate() {
			try {
				if (window.top !== window) return;
				var localVer = (_GM_info && _GM_info.script && _GM_info.script.version) || "0.0.0";
				var notified = String(_GM_getValue("xxai:notifiedVer", "") || "");
				var handled = false;
				function handle(res) {
					try {
						var head = (res.responseText || "").slice(0, 3000);
						var m = head.match(/\/\/ @version\s+([0-9]+\.[0-9]+\.[0-9]+)/);
						if (!m) return;
						var remoteVer = m[1];
						if (compareScriptVersion(remoteVer, localVer) > 0) {
							if (notified !== remoteVer) {
								_GM_setValue("xxai:notifiedVer", remoteVer);
								console.log("检测到新版本:", localVer, "->", remoteVer);
								showUpdateTip(remoteVer);
							}
						} else if (notified) {
							_GM_setValue("xxai:notifiedVer", "");
						}
					} catch (e) {}
				}
				function request(url) {
					_GM_xmlhttpRequest({
						method: "GET",
						url: url + "?t=" + Date.now(),
						timeout: 15000,
						onload: function(res) { if (!handled) { handled = true; handle(res); } },
						onerror: function() {},
						ontimeout: function() {}
					});
				}
				request(UPDATE_PROBE_URL);
				setTimeout(function() { if (!handled) request(UPDATE_CHECK_URL); }, 6000);
			} catch (e) { console.warn("更新探测失败", e); }
		}
		probeUpdate();
		setInterval(probeUpdate, UPDATE_POLL_INTERVAL);

	var marker = "data-xuexitong-ai-initialized";
	if (!document.documentElement.hasAttribute(marker)) {
		document.documentElement.setAttribute(marker, (_GM_info && _GM_info.script && _GM_info.script.version) || "2.2.1");
		const { formStore } = mountSettingsApp();
		allowCopy();
		await(start(formStore));
	}
})(Vue, Pinia, ElementPlus, $, md5);