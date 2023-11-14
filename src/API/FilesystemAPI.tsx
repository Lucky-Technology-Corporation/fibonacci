import useEndpointApi from "./EndpointAPI";
import { starterComponent, starterEndpoint, starterHelper } from "./StarterCode";

export default function useFilesystemApi(){

    const endpointApi = useEndpointApi()

  //accepts something like get-path-to-api.ts or post-.ts
  const createNewFile = async (
    relativeFilePath: string,
    endpointName?: string,
    routePath?: string,
    fallbackPath?: string,
  ): Promise<void> => {
    try {
      var fileName = "";
      if (relativeFilePath.includes("user-dependencies/")) {
        const lastIndex = relativeFilePath.lastIndexOf("/");
        fileName = relativeFilePath.substring(lastIndex + 1);

        const method = endpointName.split("/")[0];
        const endpoint = endpointName.substring(endpointName.indexOf("/"));

        const fileContent = starterEndpoint(method, endpoint);

        await endpointApi.writeFile(relativeFilePath, fileContent)

        const serverTs = await endpointApi.getFile("backend/server.ts")
        if (serverTs) {
          const content = serverTs

          // Search for block of endpoints in server.ts and using the capture group to get all the endpoints.
          const regex =
            /\/\/SWIZZLE_ENDPOINTS_START([\s\S]*)\/\/SWIZZLE_ENDPOINTS_END/g;
          const result = regex.exec(content);

          // If we can't find the endpoints block, then just return
          if (!result || result.length < 2) {
            console.log("Could not find endpoints block in server.ts");
            return;
          }

          // Turn the endpoints into individual lines removing all indendation so the sort is consistent
          const lines = result![1]
            .split("\n")
            .filter((line) => line.trim().length > 0)
            .map((line) => line.trim());

          // Include our new endpoint
          lines.push(
            `loadRouter("./user-dependencies/${fileName.replace(
              /\.ts$/,
              ".js",
            )}");`,
          );

          // Sort all the endpoints in reverse order to guarantee that endpoints with path parameters
          // come second after endpoints that don't have path parameters. For example, consider the following
          // two endpoints:
          //
          //      loadRouter("./user-dependencies/post.(test).js");
          //      loadRouter("./user-dependencies/post.test.js");
          //
          //  These endpoints represent
          //
          //      POST /:test
          //      POST /test
          //
          //  Now if a POST request comes into /test, then the ordering matters. Since /:test appears first,
          //  that endpoint will be called with the parameter :test = test. This means that it overshadows
          //  the other /test endpoint.
          //
          //  Sorting in reverse lexicographic order will produce the following:
          //
          //      loadRouter("./user-dependencies/post.test.js");
          //      loadRouter("./user-dependencies/post.(test).js");
          //
          //  This is the correct order we want.
          const sortedBlock = lines
            .sort((a, b) => b.localeCompare(a))
            .join("\n");

          const endpointsBlock = `//SWIZZLE_ENDPOINTS_START\n${sortedBlock}\n\t//SWIZZLE_ENDPOINTS_END`;
          const newContent = content.replace(regex, endpointsBlock);

          await endpointApi.writeFile("backend/server.ts", newContent)
        }
      } else if (relativeFilePath.includes("frontend/")) {
        const lastIndex = relativeFilePath.lastIndexOf("/");
        fileName = relativeFilePath.substring(lastIndex + 1);

        const basePath = relativeFilePath.split("frontend/src/")[1];

        const componentName = basePath
          .replace(".tsx", "")
          .replace(".ts", "")
          .slice(basePath.lastIndexOf("/") + 1)
          .replace(/\./g, "_")
          .replace(/^(.)/, (match, p1) => p1.toUpperCase())
          .replace(/_([a-z])/g, (match, p1) => "_" + p1.toUpperCase());

        const hasAuth = fallbackPath != undefined && fallbackPath !== "";
        var fileContent = starterComponent(componentName, hasAuth, basePath);

        await endpointApi.writeFile(relativeFilePath, fileContent)

        if (routePath != undefined && routePath !== "") {
          //Add route to RouteList.ts
          const importStatement = `import ${componentName} from './${basePath.replace(
            ".tsx",
            "",
          )}';`;
          var newRouteDefinition = `<SwizzleRoute path="${routePath}" element={<${componentName} />} />`;
          if (fallbackPath != undefined && fallbackPath !== "") {
            newRouteDefinition = `<SwizzleRoute path="${routePath}" element={<SwizzlePrivateRoute unauthenticatedFallback="${fallbackPath}" pageComponent={<${componentName} />} /> } />`
          }

          const RouteListTsx = await endpointApi.getFile("frontend/src/RouteList.tsx")

          if (RouteListTsx) {
            var content = RouteListTsx

            //Update imports
            const importRegex = /(import .*\n)+/;
            const importMatch = content.match(importRegex);
            if (importMatch) {
              const newImportBlock = importMatch[0] + importStatement + "\n";
              content = content.replace(importRegex, newImportBlock);
            }

            //Update routes
            const switchRegex = /(<SwizzleRoutes>[\s\S]*?<\/SwizzleRoutes>)/;
            const match = content.match(switchRegex);
            if (match) {
              const oldSwitchBlock = match[1];
              const sortedRoutes = addAndSortRoute(
                oldSwitchBlock,
                newRouteDefinition,
              );
              const newSwitchBlock = `<SwizzleRoutes>\n  ${sortedRoutes}\n</SwizzleRoutes>`;
              content = content.replace(oldSwitchBlock, newSwitchBlock);
            }

            //Save new file
            await endpointApi.writeFile("frontend/src/RouteList.tsx", content)
          }
        }
      } else if (relativeFilePath.includes("helpers/")) {
        fileName = relativeFilePath.split("backend/helpers/")[1];
        var fileContent = starterHelper(fileName.replace(".ts", ""))
        await endpointApi.writeFile(relativeFilePath, fileContent)
      }
    } catch (error) {
      console.log(error);
    }
  }

  const addAndSortRoute = (switchBlock: string, newRoute: string): string => {
    // `<SwizzleRoute path="${routePath.replace("/", "\/")}".*>`,

    // const routeRegex = /<SwizzleRoute[^>]*path="([^"]*)"[^>]*element={<[^>]*\/>}[^>]*\/>/g;
    const routeRegex = /<SwizzleRoute [^>]*path="([^"]*)"[^>].*/g
    let routes: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = routeRegex.exec(switchBlock))) {
      routes.push(match[0]);
    }
    routes.push(newRoute);

    routes.sort((a, b) => {
      const pathA = a.match(/path="([^"]*)"/)?.[1] ?? "";
      const pathB = b.match(/path="([^"]*)"/)?.[1] ?? "";
      return (
        (pathA.match(/\//g) || []).length - (pathB.match(/\//g) || []).length
      );
    });

    return routes.join("\n  ");
  }


  const removeFile = async (
    relativeFilePath: string,
    endpointName: string,
    routePath: string,
  ): Promise<void> => {
    console.log("removeFile");
    if (endpointName != undefined && endpointName !== "") {
      //remove from server.ts if it's an endpoint
      console.log("remove endpoint");
      const lastIndex = relativeFilePath.lastIndexOf("/");
      var fileName = relativeFilePath.substring(lastIndex + 1);

    
      const serverTs = await endpointApi.getFile("backend/server.ts")

      if (serverTs) {
        const content = serverTs

        const newContent = content.replace(
          `\nloadRouter("./user-dependencies/${fileName.replace(
            /\.ts$/,
            ".js",
          )}");`,
          ``,
        );
        await endpointApi.writeFile("backend/server.ts", content)
    }
    } else if (routePath != undefined && routePath !== "") {
      //remove from RouteList.ts if it's a route
      console.log("remove route");
      const lastIndex = relativeFilePath.lastIndexOf("/");
      var fileName = relativeFilePath.substring(lastIndex + 1);
      console.log(fileName)

      const routeListTsx = await endpointApi.getFile("frontend/src/RouteList.tsx")

      if (routeListTsx) {
        var content = routeListTsx

        const routeToRemoveRegex = new RegExp(
            // `<\\w+Route[^>]*path="${routePath}"[^>]*element={<[^>]+>}[^>]*\\/?>\\s*`,
            `<SwizzleRoute path="${routePath.replace("/", "\/")}".*>`,
            "g",
        );
        content = content.replace(routeToRemoveRegex, "");

        const importToRemoveRegex = new RegExp(
          `import ${fileName.replace(".tsx", "")}.*\n`,
          "g",
        );
        content = content.replace(importToRemoveRegex, "");

        await endpointApi.writeFile("frontend/src/RouteList.tsx", content)
      }
    }
  }

  return {
    createNewFile,
    removeFile,
  }

}