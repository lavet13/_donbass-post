import {
  createFileRoute,
  Link,
  redirect,
  useSearch,
} from "@tanstack/react-router";
import UserRegistrationPage from "@/features/user-registration/page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserLoginPage from "@/features/user-login/page";
import { Suspend } from "@/components/suspend";

type TabsSearch = {
  tab?: "login" | "sign-in";
  redirect?: string;
};

const VALID_TABS = ["login", "sign-in"] as const;

const isValidTab = (value: unknown): value is TabsSearch["tab"] => {
  return typeof value === "string" && VALID_TABS.includes(value as any);
};

export const Route = createFileRoute("/auth")({
  component: AuthComponent,
  validateSearch: (search): TabsSearch => {
    return {
      tab: isValidTab(search.tab) ? search.tab : "login",
      redirect: (search.redirect as string) || '/',
    };
  },
  beforeLoad({ context, search }) {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect });
    }
  },
});

function AuthComponent() {
  const { tab } = useSearch({
    from: Route.fullPath,
  });

  return (
    <Tabs value={tab}>
      <TabsList aria-label="Вход и регистрация">
        <TabsTrigger value="login" asChild>
          <Link to="." search={{ tab: "login" }}>
            Войти
          </Link>
        </TabsTrigger>
        <TabsTrigger value="sign-in" asChild>
          <Link to="." search={{ tab: "sign-in" }}>
            Зарегистрироваться
          </Link>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Suspend>
          <UserLoginPage />
        </Suspend>
      </TabsContent>
      <TabsContent value="sign-in">
        <Suspend>
          <UserRegistrationPage />
        </Suspend>
      </TabsContent>
    </Tabs>
  );
}
