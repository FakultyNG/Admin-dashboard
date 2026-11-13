# Reeplay API contract

> Generated from the active TypeScript backend routes. Do not edit copied versions by hand; update `scripts/generate-api-docs.mjs` and run `npm run docs:generate`.

## Environments

- Railway: `https://reeplay-api-ts-production.up.railway.app`
- Local: `http://localhost:3000`
- API prefix: `/api/v1`
- Interactive docs: `/api-docs`
- Machine-readable OpenAPI: `/openapi.json`

## Authentication

| Surface | Header | Value |
| --- | --- | --- |
| Customer app | `customer-auth` | Raw JWT (no `Bearer` prefix) |
| Client/creator | `clients-auth` | Raw JWT (no `Bearer` prefix) |
| Admin | `admin-auth` | Raw JWT; no active admin endpoints currently |
| Superadmin | `superadmin-auth` | Raw JWT (no `Bearer` prefix) |

The public login endpoint is `POST /api/v1/superadmin/auth/login`. Public customer onboarding, health checks, callbacks, advertisements, and merchant routes do not require these headers.

## Response convention

Most JSON responses use `status`, `message`, and `data`. Validation failures normally return HTTP 400, authentication failures HTTP 400/401 depending on the legacy controller, missing resources HTTP 404, and unexpected failures HTTP 500.

## Request schemas

The OpenAPI document contains reusable schemas for authentication, onboarding, profiles, payments, comments, ratings, watched progress, recent searches, plans, gift cards, casts, contestants, payouts, featured content, and push notifications. Multipart upload endpoints are marked `multipart/form-data`. Some legacy controller-only payloads remain intentionally flexible because their routes have no Joi schema.

## Endpoint inventory

### Public and service

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/` | Public | API service information |
| GET | `/health` | Public | Liveness check |
| GET | `/ready` | Public | Database readiness check |
| POST | `/api/v1/on_publish` | Public | RTMP on-publish callback |
| POST | `/api/v1/webhooks/paystack` | Public | Paystack webhook |
| POST | `/api/v1/webhooks/flutterwave/v3` | Public | Flutterwave v3 webhook |
| POST | `/api/v1/webhooks/wave` | Public | Wave webhook |
| GET | `/api/v1/merchants/giftcards/many/:currency/:email/:password` | Public | Fetch merchant gift cards |
| POST | `/api/v1/merchants/giftcards/notify/:code/:email/:password` | Public | Notify that a merchant gift card was used |
| POST | `/api/v1/merchants/giftcards/create` | Public | Create merchant credentials |

### Customer app — public

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/v1/customers/signup` | Public | Create customer account |
| POST | `/api/v1/customers/general-signin` | Public | Sign in customer |
| GET | `/api/v1/customers/verification/get-token` | Public | Request verification token |
| POST | `/api/v1/customers/signup/verifyaccount` | Public | Verify customer account |
| GET | `/api/v1/customers/general/validate-token` | Public | Validate access token |
| GET | `/api/v1/customers/general/validate-reftoken` | Public | Validate refresh token |
| GET | `/api/v1/customers/general/renew-accesstoken` | Public | Renew access token |
| POST | `/api/v1/customers/pass-reset/get-token` | Public | Request password-reset token |
| POST | `/api/v1/customers/pass-reset/change-pass` | Public | Change forgotten password |
| GET | `/api/v1/customers/pin-reset/:email` | Public | Reset customer PIN |
| GET | `/api/v1/customers/ads/random` | Public | Fetch a random advertisement |

### Customer app

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/v1/customers/view/content` | `customerAuth` | Record content view |
| GET | `/api/v1/customers/shared/subtitles/fetch/:parentId/:type` | `customerAuth` | Fetch subtitles |
| PUT | `/api/v1/customers/shared/user-profile/update/:userId` | `customerAuth` | Update user profile |
| POST | `/api/v1/customers/shared/initiate-payment` | `customerAuth` | Initiate payment |
| POST | `/api/v1/customers/shared/authorize-payment` | `customerAuth` | Authorize wallet payment |
| GET | `/api/v1/customers/shared/payment-history` | `customerAuth` | Fetch payment history |
| GET | `/api/v1/customers/shared/wallet` | `customerAuth` | Fetch wallet |
| PUT | `/api/v1/customers/shared/should-store/:paymentId` | `customerAuth` | Set whether payment details should be stored |
| GET | `/api/v1/customers/shared/payment-details` | `customerAuth` | Fetch saved payment details |
| GET | `/api/v1/customers/shared/content-costs` | `customerAuth` | Check content costs |
| GET | `/api/v1/customers/shared/check-content-payment/:contentType/:contentId` | `customerAuth` | Check payment for content |
| GET | `/api/v1/customers/shared/vods/suggestions` | `customerAuth` | Fetch VOD suggestions |
| GET | `/api/v1/customers/shared/vods/category/:catId` | `customerAuth` | Fetch VODs by category |
| GET | `/api/v1/customers/shared/vods/similar-by-cast/:castId` | `customerAuth` | Fetch similar VODs by cast |
| GET | `/api/v1/customers/shared/vods/seasons/:vidId` | `customerAuth` | Fetch seasons and episodes |
| GET | `/api/v1/customers/shared/vods/similar-by-genre/:genreId` | `customerAuth` | Fetch similar VODs by genre |
| GET | `/api/v1/customers/shared/vods/video-source/:videoId/:type` | `customerAuth` | Fetch a video source |
| GET | `/api/v1/customers/shared/vods/vod-meta/:vodId` | `customerAuth` | Fetch VOD metadata |
| GET | `/api/v1/customers/shared/vods/default-library` | `customerAuth` | Fetch default VOD library |
| GET | `/api/v1/customers/shared/vods/categ-and-genre/:genreId/:catId` | `customerAuth` | Fetch VODs by category and genre |
| GET | `/api/v1/customers/shared/featured/contents/search/:text` | `customerAuth` | Search featured content |
| GET | `/api/v1/customers/shared/get-categories` | `customerAuth` | Fetch categories |
| GET | `/api/v1/customers/shared/get-genres` | `customerAuth` | Fetch genres |
| GET | `/api/v1/customers/shared/get-casts` | `customerAuth` | Fetch casts |
| GET | `/api/v1/customers/shared/casts/:castId` | `customerAuth` | Fetch cast details |
| GET | `/api/v1/customers/profile/fetch` | `customerAuth` | Fetch customer profile |
| DELETE | `/api/v1/customers/profile/delete` | `customerAuth` | Delete customer profile |
| GET | `/api/v1/customers/upcoming/events/fetch` | `customerAuth` | Fetch upcoming events |
| GET | `/api/v1/customers/upcoming/events/is-subscribed/:id/:contentType` | `customerAuth` | Check upcoming-event subscription |
| PUT | `/api/v1/customers/upcoming/events/subscribe/:id/:contentType` | `customerAuth` | Subscribe to an upcoming event |
| PUT | `/api/v1/customers/upcoming/events/unsubscribe/:id/:contentType` | `customerAuth` | Unsubscribe from an upcoming event |
| PUT | `/api/v1/customers/settings/notification-vidquality` | `customerAuth` | Update notification and video-quality settings |
| POST | `/api/v1/customers/settings/watchlist/add` | `customerAuth` | Add item to watchlist |
| POST | `/api/v1/customers/settings/watchlist/rem` | `customerAuth` | Remove item from watchlist |
| POST | `/api/v1/customers/settings/interest/add` | `customerAuth` | Add customer interest |
| POST | `/api/v1/customers/ratings/create` | `customerAuth` | Create rating |
| GET | `/api/v1/customers/ratings/fetch/:parentId` | `customerAuth` | Fetch ratings |
| PUT | `/api/v1/customers/ratings/:ratingId` | `customerAuth` | Update rating |
| DELETE | `/api/v1/customers/ratings/:ratingId` | `customerAuth` | Delete rating |
| PUT | `/api/v1/customers/socials/create-update/reaction/:commentId/:reaction` | `customerAuth` | Create or update reaction |
| DELETE | `/api/v1/customers/socials/delete/reaction/:reactionId` | `customerAuth` | Delete reaction |
| POST | `/api/v1/customers/socials/create/comment` | `customerAuth` | Create comment |
| POST | `/api/v1/customers/socials/create/reply` | `customerAuth` | Create reply |
| GET | `/api/v1/customers/socials/fetch/comments/:parentId` | `customerAuth` | Fetch comments |
| GET | `/api/v1/customers/socials/fetch/total-comments/:parentId` | `customerAuth` | Fetch comment count |
| GET | `/api/v1/customers/socials/fetch/replies/:commentId` | `customerAuth` | Fetch replies |
| PUT | `/api/v1/customers/socials/comments/:commentId` | `customerAuth` | Update comment |
| DELETE | `/api/v1/customers/socials/comments/:commentId` | `customerAuth` | Delete comment |
| POST | `/api/v1/customers/media/vod-streaming/:vidUploadId` | `customerAuth` | Get VOD streaming URL |
| GET | `/api/v1/customers/media/vod/fetch/featured` | `customerAuth` | Fetch featured VODs |
| POST | `/api/v1/customers/media/vod/like/:id` | `customerAuth` | Like VOD |
| GET | `/api/v1/customers/media/vod/userliked/:id` | `customerAuth` | Check whether customer liked VOD |
| POST | `/api/v1/customers/media/vod/unlike/:id` | `customerAuth` | Unlike VOD |
| GET | `/api/v1/customers/enums/shared/get-categories` | `customerAuth` | Fetch categories through enums router |
| GET | `/api/v1/customers/enums/shared/get-genres` | `customerAuth` | Fetch genres through enums router |
| GET | `/api/v1/customers/enums/shared/get-casts` | `customerAuth` | Fetch casts through enums router |
| GET | `/api/v1/customers/enums/shared/casts/:castId` | `customerAuth` | Fetch cast through enums router |
| GET | `/api/v1/customers/live/events/fetch/all` | `customerAuth` | Fetch all live events |
| GET | `/api/v1/customers/live/events/fetch/featured` | `customerAuth` | Fetch featured live events |
| GET | `/api/v1/customers/live/events/fetch/sponsored` | `customerAuth` | Fetch sponsored live events |
| GET | `/api/v1/customers/live/events/fetch/channels` | `customerAuth` | Fetch channels |
| GET | `/api/v1/customers/live/events/fetch/pop/channels` | `customerAuth` | Fetch popular channels |
| GET | `/api/v1/customers/live/events/fetch/events` | `customerAuth` | Fetch events |
| GET | `/api/v1/customers/live/events/fetch/pop/events` | `customerAuth` | Fetch popular events |
| GET | `/api/v1/customers/live/events/fetch/tvshows` | `customerAuth` | Fetch TV shows |
| GET | `/api/v1/customers/live/events/fetch/pop/tvshows` | `customerAuth` | Fetch popular TV shows |
| GET | `/api/v1/customers/live/events/fetch/sports` | `customerAuth` | Fetch sports |
| GET | `/api/v1/customers/live/events/fetch/pop/sports` | `customerAuth` | Fetch popular sports |
| GET | `/api/v1/customers/live/events/fetch/podcasts` | `customerAuth` | Fetch podcasts |
| GET | `/api/v1/customers/live/events/fetch/pop/podcasts` | `customerAuth` | Fetch popular podcasts |
| GET | `/api/v1/customers/live/events/stream/:id` | `customerAuth` | Stream live event |
| GET | `/api/v1/customers/livestream/vote/fetch-info` | `customerAuth` | Fetch voting information |
| GET | `/api/v1/customers/livestream/vote/fetch-contestants` | `customerAuth` | Fetch voting contestants |
| GET | `/api/v1/customers/subscription/fetch-plans` | `customerAuth` | Fetch subscription plans |
| POST | `/api/v1/customers/subscription/create` | `customerAuth` | Create subscription |
| GET | `/api/v1/customers/subscription/status` | `customerAuth` | Fetch customer subscription status |
| POST | `/api/v1/customers/notification/device/register` | `customerAuth` | Register device token |
| POST | `/api/v1/customers/notification/device/update` | `customerAuth` | Update device token |
| DELETE | `/api/v1/customers/notification/device/remove` | `customerAuth` | Remove device token |
| POST | `/api/v1/customers/recent-search/register` | `customerAuth` | Register recent search |
| GET | `/api/v1/customers/recent-search/fetch` | `customerAuth` | Fetch recent searches |
| POST | `/api/v1/customers/watched/register` | `customerAuth` | Register watched progress |
| GET | `/api/v1/customers/watched/continue-watching` | `customerAuth` | Fetch continue-watching list |
| DELETE | `/api/v1/customers/watched/:id` | `customerAuth` | Delete watched entry |
| GET | `/api/v1/customers/vod-waitlist/` | `customerAuth` | Fetch VOD waitlist |
| DELETE | `/api/v1/customers/vod-waitlist/` | `customerAuth` | Clear VOD waitlist |
| POST | `/api/v1/customers/vod-waitlist/:videoId` | `customerAuth` | Add VOD to waitlist |
| DELETE | `/api/v1/customers/vod-waitlist/:videoId` | `customerAuth` | Remove VOD from waitlist |
| GET | `/api/v1/customers/vod-waitlist/:videoId` | `customerAuth` | Check VOD waitlist membership |
| GET | `/api/v1/customers/notifications/` | `customerAuth` | Fetch unseen notifications |
| PUT | `/api/v1/customers/notifications/` | `customerAuth` | Mark notifications as seen |
| GET | `/api/v1/customers/giftcard/redeem` | `customerAuth` | Redeem gift card |
| GET | `/api/v1/customers/banner/contents` | `customerAuth` | Fetch banner contents |
| POST | `/api/v1/customers/signup/createpin` | `customerAuth` | Create customer PIN |
| POST | `/api/v1/customers/suggestion/create` | `customerAuth` | Create customer suggestion |

### Client/creator

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/v1/clients/shared/lives/create` | `clientAuth` | Create live event |
| PUT | `/api/v1/clients/shared/lives/update-media/:liveId` | `clientAuth` | Update live-event media |
| PUT | `/api/v1/clients/shared/lives/update-active/:liveId` | `clientAuth` | Update live-event active status |
| GET | `/api/v1/clients/shared/lives/estimate` | `clientAuth` | Estimate live-event charges |
| DELETE | `/api/v1/clients/shared/lives/delete/:liveId` | `clientAuth` | Delete live event |
| PUT | `/api/v1/clients/shared/user-profile/update/:userId` | `clientAuth` | Update client profile |
| GET | `/api/v1/clients/shared/payment-history` | `clientAuth` | Fetch payment history |
| GET | `/api/v1/clients/shared/wallet` | `clientAuth` | Fetch wallet |
| PUT | `/api/v1/clients/shared/should-store/:paymentId` | `clientAuth` | Set whether payment details should be stored |
| GET | `/api/v1/clients/shared/payment-details` | `clientAuth` | Fetch saved payment details |
| GET | `/api/v1/clients/shared/content-costs` | `clientAuth` | Check content costs |
| GET | `/api/v1/clients/shared/check-content-payment/:contentType/:contentId` | `clientAuth` | Check payment for content |
| GET | `/api/v1/clients/shared/get-categories` | `clientAuth` | Fetch categories |
| GET | `/api/v1/clients/shared/get-genres` | `clientAuth` | Fetch genres |
| GET | `/api/v1/clients/shared/get-casts` | `clientAuth` | Fetch casts |
| GET | `/api/v1/clients/shared/casts/:castId` | `clientAuth` | Fetch cast details |
| POST | `/api/v1/clients/shared/initiate-payment` | `clientAuth` | Initiate payment |
| POST | `/api/v1/clients/shared/authorize-payment` | `clientAuth` | Authorize wallet payment |
| GET | `/api/v1/clients/shared/vid-upload/isready/:id` | `clientAuth` | Check video transcoding status |
| GET | `/api/v1/clients/livestream/streamkey` | `clientAuth` | Fetch livestream credentials |
| POST | `/api/v1/clients/livestream/vote/info` | `clientAuth` | Create vote information |
| PUT | `/api/v1/clients/livestream/vote/info/update` | `clientAuth` | Update vote information |
| GET | `/api/v1/clients/livestream/vote/contestant/fetch` | `clientAuth` | Fetch vote contestants |
| POST | `/api/v1/clients/livestream/vote/contestant` | `clientAuth` | Add vote contestant |
| POST | `/api/v1/clients/livestream/vote/contestant/remove` | `clientAuth` | Remove vote contestant |
| GET | `/api/v1/clients/livestream/vote/voting-status` | `clientAuth` | Fetch voting status |
| POST | `/api/v1/clients/payouts/payment/request` | `clientAuth` | Request payout |
| POST | `/api/v1/clients/payouts/payment/list-banks/:currency` | `clientAuth` | List payout banks |
| GET | `/api/v1/clients/payouts/payment/request/his` | `clientAuth` | Fetch payout request history |
| GET | `/api/v1/clients/payouts/payment/request/group` | `clientAuth` | Group payout requests |
| GET | `/api/v1/clients/event/payment/estimate` | `clientAuth` | Estimate event payment |
| GET | `/api/v1/clients/profile/fetch` | `clientAuth` | Fetch client profile |
| POST | `/api/v1/clients/notifications/create` | `clientAuth` | Create client notification |
| GET | `/api/v1/clients/history/payment/fetch` | `clientAuth` | Fetch client payment history |

### Superadmin — public

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/v1/superadmin/auth/login` | Public | Sign in superadmin |

### Superadmin

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/v1/superadmin/client-redirect/login` | `superadminAuth` | Force sign in as client |
| POST | `/api/v1/superadmin/shared/lives/create` | `superadminAuth` | Create live event |
| PUT | `/api/v1/superadmin/shared/lives/update-media/:liveId` | `superadminAuth` | Update live-event media |
| PUT | `/api/v1/superadmin/shared/lives/update-active/:liveId` | `superadminAuth` | Update live-event active status |
| GET | `/api/v1/superadmin/shared/lives/estimate` | `superadminAuth` | Estimate live-event charges |
| DELETE | `/api/v1/superadmin/shared/lives/delete/:liveId` | `superadminAuth` | Delete live event |
| GET | `/api/v1/superadmin/shared/subtitles/fetch/:parentId/:type` | `superadminAuth` | Fetch subtitles |
| PUT | `/api/v1/superadmin/shared/user-profile/update/:userId` | `superadminAuth` | Update client profile |
| GET | `/api/v1/superadmin/shared/payment-history` | `superadminAuth` | Fetch payment history |
| GET | `/api/v1/superadmin/shared/wallet` | `superadminAuth` | Fetch wallet |
| PUT | `/api/v1/superadmin/shared/should-store/:paymentId` | `superadminAuth` | Set whether payment details should be stored |
| GET | `/api/v1/superadmin/shared/payment-details` | `superadminAuth` | Fetch saved payment details |
| GET | `/api/v1/superadmin/shared/content-costs` | `superadminAuth` | Check content costs |
| GET | `/api/v1/superadmin/shared/check-content-payment/:contentType/:contentId` | `superadminAuth` | Check payment for content |
| GET | `/api/v1/superadmin/shared/get-categories` | `superadminAuth` | Fetch categories |
| GET | `/api/v1/superadmin/shared/get-genres` | `superadminAuth` | Fetch genres |
| GET | `/api/v1/superadmin/shared/get-casts` | `superadminAuth` | Fetch casts |
| GET | `/api/v1/superadmin/shared/casts/:castId` | `superadminAuth` | Fetch cast details |
| POST | `/api/v1/superadmin/shared/initiate-payment` | `superadminAuth` | Initiate payment |
| POST | `/api/v1/superadmin/shared/authorize-payment` | `superadminAuth` | Authorize wallet payment |
| GET | `/api/v1/superadmin/shared/vods/suggestions` | `superadminAuth` | Fetch VOD suggestions |
| GET | `/api/v1/superadmin/shared/vods/category/:catId` | `superadminAuth` | Fetch VODs by category |
| GET | `/api/v1/superadmin/shared/vods/similar-by-cast/:castId` | `superadminAuth` | Fetch similar VODs by cast |
| GET | `/api/v1/superadmin/shared/vods/seasons/:vidId` | `superadminAuth` | Fetch seasons and episodes |
| GET | `/api/v1/superadmin/shared/vods/similar-by-genre/:genreId` | `superadminAuth` | Fetch similar VODs by genre |
| GET | `/api/v1/superadmin/shared/vods/video-source/:videoId/:type` | `superadminAuth` | Fetch a video source |
| GET | `/api/v1/superadmin/shared/vods/vod-meta/:vodId` | `superadminAuth` | Fetch VOD metadata |
| GET | `/api/v1/superadmin/shared/vods/default-library` | `superadminAuth` | Fetch default VOD library |
| GET | `/api/v1/superadmin/shared/vods/categ-and-genre/:genreId/:catId` | `superadminAuth` | Fetch VODs by category and genre |
| GET | `/api/v1/superadmin/shared/featured/contents/search/:text` | `superadminAuth` | Search featured content |
| GET | `/api/v1/superadmin/shared/vid-upload/isready/:id` | `superadminAuth` | Check video transcoding status |
| GET | `/api/v1/superadmin/clients/allfetch` | `superadminAuth` | Fetch all clients |
| GET | `/api/v1/superadmin/clients/onefetch/:id` | `superadminAuth` | Fetch one client |
| GET | `/api/v1/superadmin/clients/deposits` | `superadminAuth` | Fetch client deposits |
| GET | `/api/v1/superadmin/enums/shared/get-categories` | `superadminAuth` | Fetch categories through enums router |
| GET | `/api/v1/superadmin/enums/shared/get-genres` | `superadminAuth` | Fetch genres through enums router |
| GET | `/api/v1/superadmin/enums/shared/get-casts` | `superadminAuth` | Fetch casts through enums router |
| GET | `/api/v1/superadmin/enums/shared/casts/:castId` | `superadminAuth` | Fetch cast through enums router |
| POST | `/api/v1/superadmin/enums/add-genre` | `superadminAuth` | Add genre |
| DELETE | `/api/v1/superadmin/enums/rem-genre/:id` | `superadminAuth` | Remove genre |
| PUT | `/api/v1/superadmin/enums/update-genre/:genreId` | `superadminAuth` | Update genre |
| POST | `/api/v1/superadmin/enums/add-category` | `superadminAuth` | Add category |
| DELETE | `/api/v1/superadmin/enums/rem-category/:id` | `superadminAuth` | Remove category |
| PUT | `/api/v1/superadmin/enums/update-category/:catId` | `superadminAuth` | Update category |
| POST | `/api/v1/superadmin/enums/add-cast` | `superadminAuth` | Add cast |
| GET | `/api/v1/superadmin/enums/search-casts/:searchText` | `superadminAuth` | Search casts |
| PUT | `/api/v1/superadmin/enums/edit-cast/:castId` | `superadminAuth` | Edit cast |
| DELETE | `/api/v1/superadmin/enums/rem-cast/:id` | `superadminAuth` | Remove cast |
| GET | `/api/v1/superadmin/media/read-photo` | `superadminAuth` | Create signed photo URL |
| GET | `/api/v1/superadmin/media/read-subtitle` | `superadminAuth` | Create signed subtitle URL |
| GET | `/api/v1/superadmin/media/read-video/:vidUploadId` | `superadminAuth` | Fetch uploaded-video stream |
| POST | `/api/v1/superadmin/media/add-subtitle` | `superadminAuth` | Upload subtitle |
| DELETE | `/api/v1/superadmin/media/delete-subtitle/:id` | `superadminAuth` | Delete subtitle |
| GET | `/api/v1/superadmin/lives/search-clients` | `superadminAuth` | Search live-event clients |
| GET | `/api/v1/superadmin/lives/all/:type` | `superadminAuth` | Fetch live events by type |
| GET | `/api/v1/superadmin/upcoming/event/getall` | `superadminAuth` | Fetch all upcoming events |
| POST | `/api/v1/superadmin/giftcard/generate/new` | `superadminAuth` | Generate gift card |
| PUT | `/api/v1/superadmin/giftcard/activate/:code/:token` | `superadminAuth` | Activate gift card |
| GET | `/api/v1/superadmin/giftcard/generated/fetch` | `superadminAuth` | Fetch generated gift cards |
| DELETE | `/api/v1/superadmin/giftcard/:id` | `superadminAuth` | Delete gift card |
| GET | `/api/v1/superadmin/payouts/request/all` | `superadminAuth` | Fetch all payout requests |
| GET | `/api/v1/superadmin/payouts/request/one/:id` | `superadminAuth` | Fetch payout request |
| PUT | `/api/v1/superadmin/payouts/request/status/:id` | `superadminAuth` | Update payout status |
| GET | `/api/v1/superadmin/suggestions/all` | `superadminAuth` | Fetch suggestions |
| PUT | `/api/v1/superadmin/suggestions/markread/:id` | `superadminAuth` | Mark suggestion read |
| DELETE | `/api/v1/superadmin/suggestions/del/:id` | `superadminAuth` | Delete suggestion |
| GET | `/api/v1/superadmin/subscription/plans/fetch` | `superadminAuth` | Fetch subscription plans |
| GET | `/api/v1/superadmin/subscription/all/fetch` | `superadminAuth` | Fetch subscriptions |
| DELETE | `/api/v1/superadmin/subscription/plans/delete/:id` | `superadminAuth` | Delete subscription plan |
| POST | `/api/v1/superadmin/subscription/plans/create` | `superadminAuth` | Create subscription plan |
| PUT | `/api/v1/superadmin/subscription/plans/update/:id` | `superadminAuth` | Update subscription plan |
| GET | `/api/v1/superadmin/featured/contents/fetch` | `superadminAuth` | Fetch featured contents |
| POST | `/api/v1/superadmin/featured/contents/add` | `superadminAuth` | Add featured content |
| GET | `/api/v1/superadmin/uploads/fetch/:type` | `superadminAuth` | Fetch uploaded videos |
| GET | `/api/v1/superadmin/uploads/seasons/fetch/:vidId` | `superadminAuth` | Fetch seasons and episodes |
| POST | `/api/v1/superadmin/uploads/video/add/:type` | `superadminAuth` | Upload video |
| GET | `/api/v1/superadmin/uploads/episodes/can-add/:seasonId` | `superadminAuth` | Check whether episode can be added |
| GET | `/api/v1/superadmin/uploads/seasons/can-add/:videoId` | `superadminAuth` | Check whether season can be added |
| POST | `/api/v1/superadmin/uploads/episodes/add/:seasonId` | `superadminAuth` | Add episode |
| POST | `/api/v1/superadmin/uploads/seasons/add/:videoId` | `superadminAuth` | Add season |
| PUT | `/api/v1/superadmin/uploads/edit/:id` | `superadminAuth` | Edit video |
| DELETE | `/api/v1/superadmin/uploads/remove/:id/:type` | `superadminAuth` | Delete video |
| GET | `/api/v1/superadmin/user/fetch` | `superadminAuth` | Fetch users |
| GET | `/api/v1/superadmin/user/fetch/:userId` | `superadminAuth` | Fetch one user |
| POST | `/api/v1/superadmin/user/send-push-notification` | `superadminAuth` | Send push notification |
| DELETE | `/api/v1/superadmin/user/deleteUser/:userId` | `superadminAuth` | Delete user |
| GET | `/api/v1/superadmin/dashboard/profile/fetch` | `superadminAuth` | Fetch current admin profile |
| PUT | `/api/v1/superadmin/dashboard/profile/edit` | `superadminAuth` | Edit current admin profile |
| GET | `/api/v1/superadmin/dashboard/topvideosbytype` | `superadminAuth` | Fetch top videos by type |
| GET | `/api/v1/superadmin/dashboard/fetchbalanceandusers` | `superadminAuth` | Fetch balances and user counts |
| GET | `/api/v1/superadmin/dashboard/totcontentsandchunks` | `superadminAuth` | Fetch content and chunk totals |
| POST | `/api/v1/superadmin/ads/create` | `superadminAuth` | Create advertisement |
| GET | `/api/v1/superadmin/ads/fetchall` | `superadminAuth` | Fetch advertisements |
| DELETE | `/api/v1/superadmin/ads/remove/:id` | `superadminAuth` | Remove advertisement |
| POST | `/api/v1/superadmin/notifications/create` | `superadminAuth` | Create admin notification |
| POST | `/api/v1/superadmin/create-super-admin` | `superadminAuth` | Create superadmin |
| POST | `/api/v1/superadmin/create-admin` | `superadminAuth` | Create admin |
| POST | `/api/v1/superadmin/create-clients` | `superadminAuth` | Create client |

## Known contract notes

- `/api/v1/admin` currently installs `admin-auth` middleware but defines no handlers.
- Merchant gift-card routes place email/password values in URL path segments. This is legacy behavior and should be replaced before production because URLs may be logged.
- `GET /superadmin/media/read-photo` and `GET /superadmin/media/read-subtitle` currently validate a JSON body. Some clients/proxies do not reliably send GET bodies; migrate these values to query parameters in a versioned change.
- The inactive `customerRoutes/notificationsRouter.ts` is not mounted and is therefore excluded.
- Webhook signature requirements are provider-specific and enforced by controller logic where implemented.

