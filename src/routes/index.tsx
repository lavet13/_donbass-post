// import ShopCostCalculationOrderPage from "@/features/shop-cost-calculation-order/page";
import UserRegistrationPage from "@/features/user-registration/page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserLoginPage from "@/features/user-login/page";
import { createFileRoute } from "@tanstack/react-router";
import { Suspend } from "@/components/suspend";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      {/* <ShopCostCalculationOrderPage /> */}
      <Tabs defaultValue="login">
        <TabsList aria-label="Вход и регистрация">
          <TabsTrigger value="login">Войти</TabsTrigger>
          <TabsTrigger value="sign-in">Зарегистрироваться</TabsTrigger>
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
    </div>
  );
}
