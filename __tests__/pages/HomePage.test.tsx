// HomePage.test.tsx

import { render, screen } from "@testing-library/react";
import { type Session } from "next-auth";
import HomePage from "~/pages";

jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Test User", email: "test@example.com" } } as Session,
  }),
}));

jest.mock("~/components/loading-screen", () => () => <div>Loading Screen</div>);

jest.mock(
  "~/components/home/layout",
  () =>
    ({ children }: { children: React.ReactNode }) =>
      <div>{children}</div>
);

jest.mock("~/components/home/room-controller", () => () => (
  <div>Room Controller</div>
));

jest.mock("~/components/home/search-bar", () => () => <div>Search Bar</div>);

jest.mock("~/components/home/room-table", () => () => <div>Room Table</div>);

test("renders HomePage", () => {
  render(<HomePage />);
  const linkElement = screen.getByText(/Loading Screen/i);
  expect(linkElement).toBeInTheDocument();
});
