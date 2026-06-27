import { createRouter, createWebHashHistory } from "vue-router";
import { getFlareSdkSingleton } from "flare-core-vue-im-ui/app";
import ChatPlaceholderView from "./views/ChatPlaceholderView.vue";
import ChatView from "./views/ChatView.vue";
import ConversationsView from "./views/ConversationsView.vue";
import LoginView from "./views/LoginView.vue";
import SyncProgressView from "./views/SyncProgressView.vue";
import WorkbenchLayout from "./views/WorkbenchLayout.vue";

const SdkLabView = () => import("./views/SdkLabView.vue");

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { public: true },
    },
    {
      path: "/sync",
      name: "sync",
      component: SyncProgressView,
    },
    {
      path: "/",
      component: WorkbenchLayout,
      children: [
        { path: "", redirect: { name: "conversations" } },
        {
          path: "conversations",
          name: "conversations",
          components: {
            conversation: ConversationsView,
            main: ChatPlaceholderView,
          },
        },
        {
          path: "chat",
          name: "chat",
          components: {
            conversation: ConversationsView,
            main: ChatView,
          },
        },
        {
          path: "sdk-lab",
          name: "sdk-lab",
          components: {
            main: SdkLabView,
          },
        },
      ],
    },
    { path: "/:pathMatch(.*)*", redirect: { name: "conversations" } },
  ],
});

router.beforeEach((to) => {
  if (to.meta.public) return true;
  const sdk = getFlareSdkSingleton();
  const loggedIn = sdk?.loggedIn.value ?? false;
  if (!loggedIn) return { name: "login", replace: true };
  if (to.name === "sync") {
    return sdk?.homeSyncReady.value ? { name: "conversations", replace: true } : true;
  }
  if (!sdk?.homeSyncReady.value) {
    return { name: "sync", replace: true };
  }
  if (to.name === "chat" && !sdk?.activeConversationId.value) {
    return { name: "conversations", replace: true };
  }
  return true;
});

export type WorkbenchRouteName = "conversations" | "chat" | "sdk-lab" | "sync";
