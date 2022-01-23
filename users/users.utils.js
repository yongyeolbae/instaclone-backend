import jwt from "jsonwebtoken";
import client from "../client";


// 받은 토큰을 이용해서 로그인한 사용자의 정보를 가져오는 함수
export const handleGetUser = async (token) => {
  try {
    if (!token) {
      return null;
    }
    const { id } = await jwt.verify(token, process.env.SECRET_KEY);
    const loggedInUser = await client.user.findUnique({ where: { id } });

    if (loggedInUser) {
      return loggedInUser;
    } else {
      return null;
    }
  } catch (error) {
    console.log("handleGetUser error", error);
    return null;
  }
};

export function protectedResolver(ourResolver) {
  return function (root, args, context, info) {
    if (!context.loggedInUser) {
      const query = info.operation.operation === "query";
      if (query) {
        return null;
      } else {
        return {
          ok: false,
          error: "Please log in to perform this action.",
        };
      }
    }
    return ourResolver(root, args, context, info);
  };
}
