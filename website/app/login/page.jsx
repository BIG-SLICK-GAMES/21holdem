import LoginPanel from "../LoginPanel";

export const metadata = {
  title: "Login | 21 Hold'em"
};

export default function LoginPage() {
  return <LoginPanel mode="login" gameUrl="/lobby" />;
}

