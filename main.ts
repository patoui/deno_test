import { Application, configure, Router } from "./deps.ts";
import { homeHandler } from "./application/http/controllers/home.ts";
import { aboutHandler } from "./application/http/controllers/about.ts";
import {
  authUserHandler,
  createUserHandler,
  signInUserHandler,
  signOutUserHandler,
  signUpUserHandler,
} from "./application/http/controllers/auth.ts";
import { authed } from "./application/http/middleware/authed.ts";
import { staticFiles } from "./application/http/middleware/static.ts";
import { showCreateListingHandler, createListingHandler } from "./application/http/controllers/listing.ts";

const port = 8080;
const app = new Application();
const router = new Router();

configure({ views: `${Deno.cwd()}/application/views/` });

router.get("/", homeHandler);
router.get("/about", aboutHandler);

// authentication
router.get("/sign-up", signUpUserHandler);
router.post("/sign-up", createUserHandler);
router.get("/sign-in", signInUserHandler);
router.post("/sign-in", authUserHandler);
router.get("/sign-out", signOutUserHandler);

// listing
router.get("/listing/create", showCreateListingHandler);
router.post("/listing", createListingHandler);

app.use(authed);
app.use(router.routes());
app.use(router.allowedMethods());
app.use(staticFiles);

app.listen({ port });
console.log(`Server is running on port ${port}`);
