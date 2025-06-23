import type { ApiResponses } from "@/server/lib/route-types";
import { hc } from "hono/client";
import type { AppType } from "@/index";

// 创建一个轻量级的类型化客户端
export const createTypedClient = (baseUrl: string) => {
  const client = hc<AppType>(baseUrl);
  
  // 返回预定义类型的客户端方法，避免运行时类型推断
  return {
    api: {
      $get: async () => {
        const res = await client.api.$get();
        return res as {
          ok: boolean;
          status: number;
          statusText: string;
          json: () => Promise<ApiResponses["/api"]["GET"]["output"]>;
        };
      },
      health: {
        $get: async () => {
          const res = await client.api.health.$get();
          return res as {
            ok: boolean;
            status: number;
            statusText: string;
            json: () => Promise<ApiResponses["/api/health"]["GET"]["output"]>;
          };
        },
      },
      me: {
        $get: async () => {
          const res = await client.api.me.$get();
          return res as {
            ok: boolean;
            status: number;
            statusText: string;
            json: () => Promise<ApiResponses["/api/me"]["GET"]["output"]>;
          };
        },
      },
      tasks: {
        $get: async () => {
          const res = await client.api.tasks.$get();
          return res as {
            ok: boolean;
            status: number;
            statusText: string;
            json: () => Promise<ApiResponses["/api/tasks"]["GET"]["output"]>;
          };
        },
        $post: async (args: { json: ApiResponses["/api/tasks"]["POST"]["input"] }) => {
          const res = await client.api.tasks.$post(args);
          return res as {
            ok: boolean;
            status: number;
            statusText: string;
            json: () => Promise<ApiResponses["/api/tasks"]["POST"]["output"]>;
          };
        },
        ":id": {
          $get: async (args: { param: { id: string | number } }) => {
            const res = await client.api.tasks[":id"].$get({
              param: { id: args.param.id.toString() }
            });
            return res as {
              ok: boolean;
              status: number;
              statusText: string;
              json: () => Promise<ApiResponses["/api/tasks/:id"]["GET"]["output"]>;
            };
          },
          $patch: async (args: { 
            param: { id: string | number };
            json: ApiResponses["/api/tasks/:id"]["PATCH"]["input"];
          }) => {
            const res = await client.api.tasks[":id"].$patch({
              param: { id: args.param.id.toString() },
              json: args.json
            });
            return res as {
              ok: boolean;
              status: number;
              statusText: string;
              json: () => Promise<ApiResponses["/api/tasks/:id"]["PATCH"]["output"]>;
            };
          },
          $delete: async (args: { param: { id: string | number } }) => {
            const res = await client.api.tasks[":id"].$delete({
              param: { id: args.param.id.toString() }
            });
            return res as {
              ok: boolean;
              status: number;
              statusText: string;
              json: () => Promise<void>;
            };
          },
        },
      },
    },
  };
};