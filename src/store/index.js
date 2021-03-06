import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
import mutations from "./mutations";
import actions from "./actions";
import initLocalStorage from "./initLocalStorage";
import { Howler } from "howler";
import { changeAppearance } from "@/utils/common";
import updateApp from "@/utils/updateApp";
import pkg from "../../package.json";
// vuex 自定义插件
import { getBroadcastPlugin } from "./plugins/broadcast";
import saveToLocalStorage from "./plugins/localStorage";

if (localStorage.getItem("appVersion") === null) {
  localStorage.setItem("player", JSON.stringify(initLocalStorage.player));
  localStorage.setItem("settings", JSON.stringify(initLocalStorage.settings));
  localStorage.setItem("data", JSON.stringify(initLocalStorage.data));
  localStorage.setItem("appVersion", pkg.version);
  window.location.reload();
}

updateApp();

Vue.use(Vuex);

let plugins = [saveToLocalStorage];
if (process.env.IS_ELECTRON === true) {
  let vuexBroadCast = getBroadcastPlugin();
  plugins.push(vuexBroadCast);
}

const options = {
  state,
  mutations,
  actions,
  plugins,
};

const store = new Vuex.Store(options);

Howler.volume(store.state.player.volume);
// 防止软件第一次打开资源加载2次
Howler.autoUnlock = false;

const currentTrackId = store.state?.player?.currentTrack?.id;
if (currentTrackId) {
  store.dispatch("switchTrack", {
    id: currentTrackId,
    autoplay: false,
  });
}

if ([undefined, null].includes(store.state.settings.lang)) {
  let lang = "en";
  if (navigator.language.slice(0, 2) === "zh") lang = "zh-CN";
  store.state.settings.lang = lang;
  localStorage.setItem("settings", JSON.stringify(store.state.settings));
}

changeAppearance(store.state.settings.appearance);

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    if (store.state.settings.appearance === "auto") {
      changeAppearance(store.state.settings.appearance);
    }
  });

export default store;
