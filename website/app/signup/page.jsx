import LoginPanel from "../LoginPanel";

export const metadata = {
  title: "Sign Up | 21 Hold'em"
};

export default function SignupPage() {
  return <LoginPanel mode="signup" gameUrl="/lobby" />;
}

