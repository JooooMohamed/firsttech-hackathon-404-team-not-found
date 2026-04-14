import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function createContext(roles: string[]): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user: { roles } }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as any;
  }

  it("should allow access when no roles are required", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);
    const context = createContext(["member"]);
    expect(guard.canActivate(context)).toBe(true);
  });

  it("should allow access when user has a required role", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["admin", "staff"]);
    const context = createContext(["staff"]);
    expect(guard.canActivate(context)).toBe(true);
  });

  it("should deny access when user lacks required roles", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["admin"]);
    const context = createContext(["member"]);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
