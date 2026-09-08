import axios from "../axios";
import { buyChips, confirmPayment, getChips } from "./shop.query";

jest.mock("../axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe("shop queries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loads chip shop items", async () => {
    axios.get.mockResolvedValueOnce({ data: { data: [] } });

    await getChips();

    expect(axios.get).toHaveBeenCalledWith("/api/v1/shop");
  });

  test("starts a chip checkout session", async () => {
    const payload = { nPrice: 9.99 };
    axios.post.mockResolvedValueOnce({ data: { data: { sessionId: "cs_test_123" } } });

    await buyChips(payload);

    expect(axios.post).toHaveBeenCalledWith("/api/v1/shop/buy", payload);
  });

  test("confirms a Stripe checkout session", async () => {
    axios.get.mockResolvedValueOnce({ data: { message: "Payment confirmed" } });

    await confirmPayment({ session_id: "cs_test_123/with space" });

    expect(axios.get).toHaveBeenCalledWith("/api/v1/shop/confirm?session_id=cs_test_123%2Fwith%20space");
  });
});
