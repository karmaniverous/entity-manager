### Changelog

All notable changes to this project will be documented in this file. Dates are displayed in UTC.

#### [v7.3.1](https://github.com/karmaniverous/entity-manager/compare/v7.3.0...v7.3.1)

- feat(validation): reject duplicate index pairs; type-safe findIndexToken [`e355f1c`](https://github.com/karmaniverous/entity-manager/commit/e355f1c4e65bb571e74a46e17ce922035ac136b4)
- docs: note CF phantom generic in TSDoc; single-arg factory [`09ca91f`](https://github.com/karmaniverous/entity-manager/commit/09ca91f5d2a04efcc3888f8541e0c869d0e15309)
- fix: overload call for findIndexToken; clean TSDoc [`d49b13e`](https://github.com/karmaniverous/entity-manager/commit/d49b13e84b0c54a879c90722ed71cdfbfe1af1a9)

#### [v7.3.0](https://github.com/karmaniverous/entity-manager/compare/v7.2.0...v7.3.0)

> 28 November 2025

- docs: carry CF type via generics; update plan [`dc3dbb8`](https://github.com/karmaniverous/entity-manager/commit/dc3dbb83d016ed82cdfeb2517b847fc3763da62a)
- updated docs [`d8d361f`](https://github.com/karmaniverous/entity-manager/commit/d8d361fbf1c89481962834857331cc2dd64884c9)
- chore: release v7.3.0 [`2804c4b`](https://github.com/karmaniverous/entity-manager/commit/2804c4be7ebfd1f10c23ecd9de514c9b31651e2b)
- docs(interop): response for config-literal index typing [`7d6c197`](https://github.com/karmaniverous/entity-manager/commit/7d6c1978b7abd2bce92afd77576fbad0e450780c)
- feat: thread CF via EntityManager generic (type-only) [`3e55912`](https://github.com/karmaniverous/entity-manager/commit/3e559120c97501985e27d6051c6ab09310ad6755)

#### [v7.2.0](https://github.com/karmaniverous/entity-manager/compare/v7.1.2...v7.2.0)

> 20 November 2025

- chore: release v7.2.0 [`77e8eb8`](https://github.com/karmaniverous/entity-manager/commit/77e8eb827b51028affe7cd7a753216ef1d85141d)
- added ConfigOfClient exports [`9880e59`](https://github.com/karmaniverous/entity-manager/commit/9880e592da025e5970510b392c8fa4952c10dbd1)

#### [v7.1.2](https://github.com/karmaniverous/entity-manager/compare/v7.1.1...v7.1.2)

> 20 November 2025

- interop [`ec56477`](https://github.com/karmaniverous/entity-manager/commit/ec56477c98689e14ec64411b3d6e65f0206a10a2)
- chore: release v7.1.2 [`6519a4a`](https://github.com/karmaniverous/entity-manager/commit/6519a4ab3853e4c3a7edc0b457a1c78b2d318f80)
- docs(interop): note ET-aware QueryBuilder options for DynamoDB adapter [`438a787`](https://github.com/karmaniverous/entity-manager/commit/438a787d687c1aa0e068d5dfa482b9502d41233c)
- test(tsd): pin ET-aware QueryBuilder options.item typing [`355ffdd`](https://github.com/karmaniverous/entity-manager/commit/355ffdd857d816b909ad493afaa99ee72772dd14)
- feat(types): make QueryBuilder options ET-aware [`2b70303`](https://github.com/karmaniverous/entity-manager/commit/2b7030306c10dcf6498a2283653a410fed4ace7f)
- test(tsd): relax negative assignability checks in ET options test [`1e654d8`](https://github.com/karmaniverous/entity-manager/commit/1e654d8506bd0a44a76221e0c00f779e13340288)

#### [v7.1.1](https://github.com/karmaniverous/entity-manager/compare/v7.1.0...v7.1.1)

> 20 November 2025

- imports [`b38bdce`](https://github.com/karmaniverous/entity-manager/commit/b38bdcee55e24e2390241a89eb23b0b6d5dd4b13)
- fix: accept compile-time entitiesSchema; add runtime tests [`fa58779`](https://github.com/karmaniverous/entity-manager/commit/fa58779f752e174ed54e594447bdb72db95fac9b)
- chore: trim dev plan; refactor requirements to repo scope [`2cae618`](https://github.com/karmaniverous/entity-manager/commit/2cae618f7e5d8655b5867e71367ca298ca3934fa)
- chore: release v7.1.1 [`82cfd34`](https://github.com/karmaniverous/entity-manager/commit/82cfd34b10d11c9132634328d8cf45512090456e)
- docs(readability): define CF/CC inline in README; log policy move [`09d82c9`](https://github.com/karmaniverous/entity-manager/commit/09d82c9d92647d637331216b0caa7cd980a88a94)
- docs: adopt Option B helper typing + acronym policy [`2b6da7e`](https://github.com/karmaniverous/entity-manager/commit/2b6da7e84cb1f17afe18eefb4a1c56532cc4613c)
- deleted interop message [`5d0c375`](https://github.com/karmaniverous/entity-manager/commit/5d0c37579cb3ae3c9989fea40cec2249553ffe56)
- docs: move acronym policy to project prompt; align plan [`2befd64`](https://github.com/karmaniverous/entity-manager/commit/2befd6492747e5542ea0f6f87d565b05fdb73b28)
- test: fix lint and failing validation tests [`614ac06`](https://github.com/karmaniverous/entity-manager/commit/614ac066ca23a432bddf0e0faffe6a35ab241316)
- chore(todo): mark acronym readability pass as done [`4ff2e0f`](https://github.com/karmaniverous/entity-manager/commit/4ff2e0fda9253047d7601f075d6f1e01ee1726b2)

#### [v7.1.0](https://github.com/karmaniverous/entity-manager/compare/v7.0.1...v7.1.0)

> 18 November 2025

- feat: projection-aware typed query results (type-only) [`68e890c`](https://github.com/karmaniverous/entity-manager/commit/68e890cc4b4ac41f63e3c6405343724a2620af6c)
- docs(README): add projection K section; interop note [`83a9751`](https://github.com/karmaniverous/entity-manager/commit/83a97514167581574b57c4e4bec485f2db0203dd)
- chore: release v7.1.0 [`a2086f7`](https://github.com/karmaniverous/entity-manager/commit/a2086f7f1c8b62c53cc15945664c8b4b7f456d8e)
- refactor(todo): prioritize projection K fix, docs, and interop [`c0f4d8c`](https://github.com/karmaniverous/entity-manager/commit/c0f4d8c57c94ce3c86229a6b74b785a87b197b46)
- test/docs/interop: projection K typing test, requirements update, and adapter note [`1d53edd`](https://github.com/karmaniverous/entity-manager/commit/1d53edd7f028100c00bde6de315fcded43c8479c)
- types: fix Projected&lt;K&gt; to ignore index signature [`8f773e5`](https://github.com/karmaniverous/entity-manager/commit/8f773e57499c0c26327b9087b3262fdf28324b39)
- fix: restore EntityItemByToken import and satisfy ESLint rule [`ec7077b`](https://github.com/karmaniverous/entity-manager/commit/ec7077b55c08e6a0aa813219da28e51e569a5411)
- feat: thread projection K through BaseQueryBuilder (type-only) [`797bf34`](https://github.com/karmaniverous/entity-manager/commit/797bf342588d3779b5ac25e4e8b5d9609aa04c2b)
- types: guard Projected&lt;T,K&gt; for non-object T [`c61ca90`](https://github.com/karmaniverous/entity-manager/commit/c61ca9019634b4a185201d6b5f89625d75b1f7d2)
- imports [`1bcba20`](https://github.com/karmaniverous/entity-manager/commit/1bcba2077355c24d68e99a5b570ea02276206b90)
- docs: prune Next up — projection K fix completed [`11f00ff`](https://github.com/karmaniverous/entity-manager/commit/11f00ffbc7b674ede6f14551efe404cf2c0d3759)

#### [v7.0.1](https://github.com/karmaniverous/entity-manager/compare/v7.0.0...v7.0.1)

> 18 November 2025

- Normalize line endings [`640190e`](https://github.com/karmaniverous/entity-manager/commit/640190e36c52d8ab896a2a3368d9d7aac1bf035f)
- fix: use type-only z namespace and z.infer [`fb151ec`](https://github.com/karmaniverous/entity-manager/commit/fb151ec90a2a8dbea91b02db6b15171a575553d3)
- chore: release v7.0.1 [`33ed1d1`](https://github.com/karmaniverous/entity-manager/commit/33ed1d10c2448c9d7d82b7614b059fb154663d10)

### [v7.0.0](https://github.com/karmaniverous/entity-manager/compare/v6.14.3...v7.0.0)

> 18 November 2025

- chore: step 3 typing — thread ET/ITS and add PKBI/PKMBIS [`8b1a5fe`](https://github.com/karmaniverous/entity-manager/commit/8b1a5febb15b2fad0b44bfad97a1949ee1f57d17)
- chore: step 1 — align with entity-tools rename (types only) [`580fffe`](https://github.com/karmaniverous/entity-manager/commit/580fffe436987f00c67ccf6b93722b442a9c2c0e)
- updated dependencies [`a630525`](https://github.com/karmaniverous/entity-manager/commit/a630525c67dd635e7cbb8ee55169b5556cf023a4)
- docs: replace TranscodeMap with TranscodeRegistry in TSDoc; silence TypeDoc warnings [`084c762`](https://github.com/karmaniverous/entity-manager/commit/084c76211b98953b4ea08995ca2dfae7bd4f595c)
- refactor(types): adopt strict acronym CC for public generics (Step 2) [`e594835`](https://github.com/karmaniverous/entity-manager/commit/e5948354e063e76029b8eddb9b181b365bba9c75)
- fix(types): remove abbreviated TokenAware exports; align ET-aware overloads [`aa075ab`](https://github.com/karmaniverous/entity-manager/commit/aa075abb78fd1644066f36e7654e1ec80a887f4d)
- chore: fix typing fallout — QueryBuilder generics, page-key maps, tests [`521bb3d`](https://github.com/karmaniverous/entity-manager/commit/521bb3df6fe1d9f9921d495c894802429438e941)
- feat(types): token-aware helpers + ET-aware overloads; require entityToken for decodeGeneratedProperty [`71de3a3`](https://github.com/karmaniverous/entity-manager/commit/71de3a34738aa3f5694c1d6ffa7c30b58f9e981e)
- fix(overloads): make EntityManager impl signatures broad; lint/tsdoc cleanup [`6ae6845`](https://github.com/karmaniverous/entity-manager/commit/6ae68450a300c53b867805f055f752b236ff47bf)
- fix(types): align ET-aware overload implementations; replace deprecated Zod type [`3a41d8a`](https://github.com/karmaniverous/entity-manager/commit/3a41d8aaf03733c263a4080eb2129ef6a89921e4)
- chore: release v7.0.0 [`9c3b087`](https://github.com/karmaniverous/entity-manager/commit/9c3b0872c3d148aec55542a2cd3145ea08314847)
- feat(types): thread CF through QueryOptions and query pipeline [`f4c1722`](https://github.com/karmaniverous/entity-manager/commit/f4c17223da7a32de13181705f067b5e0442b4bed)
- feat(types): add ShardQueryMapByCF (derive ITS from CF.indexes) [`ddb951e`](https://github.com/karmaniverous/entity-manager/commit/ddb951e41dc273f38a04281a7445a4831736cd4c)
- feat(types): CF-index-aware ShardQueryFunction; add tsd negative case [`d6d82b9`](https://github.com/karmaniverous/entity-manager/commit/d6d82b9c4a0b82858725a0bb6f3d5243407ce99c)
- updated requirements & dev plan [`91f9bcc`](https://github.com/karmaniverous/entity-manager/commit/91f9bcc9e7b45c63c86b59f0ff67b85cacd0581b)
- fix(types): add CF generic to EntityManager.query and forward to query() [`5d8bd75`](https://github.com/karmaniverous/entity-manager/commit/5d8bd75c3d12427d54db7e3f50d32eb8dc6bf78e)
- chore: silence IDE TS errors in tsd tests [`3e367e1`](https://github.com/karmaniverous/entity-manager/commit/3e367e15f23a0ec4a788310e6f51d31863ef9509)
- chore: silence placeholder-generic lint and fix tsd width assertions [`d8f8107`](https://github.com/karmaniverous/entity-manager/commit/d8f8107385dc79fa20e236023098bdb403e1b44f)
- feat: export factory and add IndexTokensFrom helper [`059a2db`](https://github.com/karmaniverous/entity-manager/commit/059a2dbf161f026c8e1216403dd00425e2840848)
- docs: export helper types to clear TypeDoc warnings [`ace6ab1`](https://github.com/karmaniverous/entity-manager/commit/ace6ab10395847899f262276ebe80aa614614f56)
- feat: add inference-first typing requirements and interop notes [`bf31c55`](https://github.com/karmaniverous/entity-manager/commit/bf31c557347fd0c73e2b8636651d449f9a692137)
- interop [`6771dc8`](https://github.com/karmaniverous/entity-manager/commit/6771dc8ddf831fcdb341393d746030b4a00325be)
- feat(types): DX alias to derive ITS from CF.indexes [`3061185`](https://github.com/karmaniverous/entity-manager/commit/3061185ceb5d1ead823fe95e7e977a1e6c00ac79)
- feat(types,tests): add CC-based DX aliases + tsd coverage [`b2371c1`](https://github.com/karmaniverous/entity-manager/commit/b2371c10b58a499f37e7f86d2abe47a4d7d91cb1)
- feat(factory): schema-first EM inference; remove MinimalEntityMapFrom [`ce2f8b5`](https://github.com/karmaniverous/entity-manager/commit/ce2f8b530174ea14cdc3b1625591e1e4b7441ed2)
- fix(overloads): use broad implementation signatures for ET-aware methods [`5efb16f`](https://github.com/karmaniverous/entity-manager/commit/5efb16f049acb9c721156c4ebcb629500b0f4a07)
- fix: finalize TranscodeRegistry rename; repair Config type and typedoc links [`dca5b30`](https://github.com/karmaniverous/entity-manager/commit/dca5b30db3967f2333479084a8389c410694cda8)
- docs: export PageKey helper types to clear TypeDoc warnings [`0d1dac5`](https://github.com/karmaniverous/entity-manager/commit/0d1dac51401ec77f46bd623cf2117c8a430e5cb9)
- feat(types): refine PKBI with optional config-literal narrowing [`f186c92`](https://github.com/karmaniverous/entity-manager/commit/f186c92208a5d5519b7cef81dd4bd216defa7a25)
- test(tsd): fix CF narrowing tests to satisfy Entity constraints and lint [`cf6ca34`](https://github.com/karmaniverous/entity-manager/commit/cf6ca34fca226b983f4d1515a7a3c942304e6795)
- docs: export IndexComponentTokens to clear TypeDoc warning [`2a96d5a`](https://github.com/karmaniverous/entity-manager/commit/2a96d5a04faaa4f747dabb9c17a6dcc43bfc4378)
- docs: clear final TypeDoc warning by fixing BaseQueryBuilder TSDoc [`c41aa41`](https://github.com/karmaniverous/entity-manager/commit/c41aa4160cddd8af6d6f86bdeea80f01ed4ab893)
- fix(typing): remove unused ET generic in unwrapIndex [`42042aa`](https://github.com/karmaniverous/entity-manager/commit/42042aa1849949ddd41af29b3bd2b26712d2faeb)
- fix(types): resolve TS2536 in PKBI CF narrowing and silence ET lint [`f9fe137`](https://github.com/karmaniverous/entity-manager/commit/f9fe1372cdbde42f1064bbd4dd19f9c95a6595b7)
- typing: CF/IT-aware unwrapIndex + TODO log [`74b97e5`](https://github.com/karmaniverous/entity-manager/commit/74b97e508d3919f5bf3b8da6e2117066c65e5c90)
- docs+dx: README (CC sugar) and interop response for client [`d7a2f0a`](https://github.com/karmaniverous/entity-manager/commit/d7a2f0af5896b07fb1d63b66761b49cd2faac0b1)
- fix(overloads): remove broad overloads; align ET-aware implementations [`47dcba2`](https://github.com/karmaniverous/entity-manager/commit/47dcba2f2f0882a1c5407c5b7b32481f2b3ee471)
- test(tsd): add CF-based PageKeyByIndex narrowing tests; update plan [`4a46dd3`](https://github.com/karmaniverous/entity-manager/commit/4a46dd35387478ecdd9d06fea83bcf0a26b3b243)
- feat: introduce values-first createEntityManager factory (non-breaking) [`ee50a02`](https://github.com/karmaniverous/entity-manager/commit/ee50a02b27e59fffc7c6230fc28c57fdd251c25a)
- test(tsd): consume @ts-expect-error for CF-indexed ShardQueryMap [`6cc53ba`](https://github.com/karmaniverous/entity-manager/commit/6cc53ba4afef5dbc4fc33795768629b5b56f8250)
- feat(types): CF/IT-aware getIndexComponents return type [`771ba7e`](https://github.com/karmaniverous/entity-manager/commit/771ba7ef15f7d76cc167089a82fd32d58b572873)
- feat(types): constrain ShardQueryMap keys by CF.indexes + tsd check [`fffdca8`](https://github.com/karmaniverous/entity-manager/commit/fffdca8585a85ead56b4749358c6f22ed50acc37)
- test(types): use typed ShardQueryMap vars to preserve ITS unions [`e42b2c2`](https://github.com/karmaniverous/entity-manager/commit/e42b2c28fa6b8dee324e5011f753c2a958232f68)
- chore: refine tsd assertions to avoid width-compat mismatch [`241cb3a`](https://github.com/karmaniverous/entity-manager/commit/241cb3a002f8f8966e40a8fd1622f57fb18bf276)
- chore: fix lint in tsd test by avoiding explicit any [`8e19ad1`](https://github.com/karmaniverous/entity-manager/commit/8e19ad15338caea10fe216e6637a251f3e587caf)
- test(tsd): move @ts-expect-error to offending property line [`7ef98ee`](https://github.com/karmaniverous/entity-manager/commit/7ef98ee61bf377fd5905fdf3c2ab114e513f800a)

#### [v6.14.3](https://github.com/karmaniverous/entity-manager/compare/v6.14.2...v6.14.3)

> 12 November 2025

- chore: getPrimaryKey returns arrays; add tests [`7153fcc`](https://github.com/karmaniverous/entity-manager/commit/7153fccb9a5cf2d6cb762239fd51d6a4862b914a)
- chore: release v6.14.3 [`56fd796`](https://github.com/karmaniverous/entity-manager/commit/56fd79609fe152a2821d6c2ab6fecfe3dd8e24d9)
- chore: fix getPrimaryKey tests to use static key names [`9aa7ef2`](https://github.com/karmaniverous/entity-manager/commit/9aa7ef26da2edb94bfaf935d5128fbf1f7cfe79d)
- updated readme [`b4c212c`](https://github.com/karmaniverous/entity-manager/commit/b4c212c2c370b65415db4f1dab42a51b981ddaa5)

#### [v6.14.2](https://github.com/karmaniverous/entity-manager/compare/v6.14.1...v6.14.2)

> 12 November 2025

- feat: auto-constrain shard space when unique is present [`3904436`](https://github.com/karmaniverous/entity-manager/commit/3904436286e57ed0cfb3e646709a5ac8c6c79fb2)
- chore: release v6.14.2 [`cc6e5e0`](https://github.com/karmaniverous/entity-manager/commit/cc6e5e00071cfddf75524cb4f711fdc926f15dfb)

#### [v6.14.1](https://github.com/karmaniverous/entity-manager/compare/v6.14.0...v6.14.1)

> 4 November 2025

- chore: migrate Mocha/NYC to Vitest; ESLint TS flat config [`56ab35e`](https://github.com/karmaniverous/entity-manager/commit/56ab35e009fb050a3d63f656b68d414f2c311e1c)
- updated docs [`7cb7134`](https://github.com/karmaniverous/entity-manager/commit/7cb7134c0f17cd8825001f76584f28225778e33f)
- chore: enforce typed ESLint on tests; fix lint issues [`67b76f0`](https://github.com/karmaniverous/entity-manager/commit/67b76f09d4d5a61a575aa688146eac8156b4e571)
- imports [`86893fd`](https://github.com/karmaniverous/entity-manager/commit/86893fd761ed6684692127dc415b96d91b51487a)
- refactor(zod): remove deprecated APIs; fix TS/lint/build [`88274eb`](https://github.com/karmaniverous/entity-manager/commit/88274ebd3ddeac54a733e3a862a9c517b38c73e4)
- refactor: Zod v4 compatibility; fix imports; robust ESLint [`7a59329`](https://github.com/karmaniverous/entity-manager/commit/7a593290e5ccba0687ce1918d83c65fef534fc89)
- fix: resolve TS2769 in ParsedConfig; silence dynamic delete [`67fde53`](https://github.com/karmaniverous/entity-manager/commit/67fde539dd408b3f9e6d541a8a95b6c7e4c67531)
- docs: fix TypeDoc @param name for getPrimaryKey overload [`bb4eb75`](https://github.com/karmaniverous/entity-manager/commit/bb4eb75dfdd450e036e325253865cc37a8e73301)
- fix: clear TS/lint/build/test issues; finalize quiet tests [`20d6437`](https://github.com/karmaniverous/entity-manager/commit/20d64371a1655d6cfd979fdcac4cb1e4dcd74704)
- updated dependencies & docs [`01a7983`](https://github.com/karmaniverous/entity-manager/commit/01a798344d26794ebb7e462e25ef63f36d13ebdd)
- docs: fix TypeDoc @param mismatch on array overloads [`bac001a`](https://github.com/karmaniverous/entity-manager/commit/bac001a6f7a2f0c2db6da23ea6f8a539ebab1db8)
- Implement full shard-space assignment and add test [`b7f9c3e`](https://github.com/karmaniverous/entity-manager/commit/b7f9c3e79bf701be1e1d2b1917f46c2e309116c4)
- updated readme [`97d4f59`](https://github.com/karmaniverous/entity-manager/commit/97d4f5927f2bb30450d5013c1337e7f352ebf774)
- Add authoritative stan.requirements.md and update TODO [`525d869`](https://github.com/karmaniverous/entity-manager/commit/525d8697e1dd674218ad27b0c66fad61523a0426)
- chore: release v6.14.1 [`03d5126`](https://github.com/karmaniverous/entity-manager/commit/03d51266fbbdf59d58a778266140a21bbc94b0cb)
- updated docs [`f1d8374`](https://github.com/karmaniverous/entity-manager/commit/f1d83748ccf5125fd018000637b943a99bbe8d4c)
- updated docs [`bf44f90`](https://github.com/karmaniverous/entity-manager/commit/bf44f905818cbf5dd68006493ee80b072df7ebd9)
- resolved tsd issues [`b6b1e2c`](https://github.com/karmaniverous/entity-manager/commit/b6b1e2c7478f5c598c2c17c218527c911a7e52ec)
- refactor: remove dynamic delete in removeKeys; docs update [`33d51fa`](https://github.com/karmaniverous/entity-manager/commit/33d51fa03772ef733e29cd8c2c13c08c39dda2e6)
- chore(test): silence debug logs to reduce Vitest output [`b09755d`](https://github.com/karmaniverous/entity-manager/commit/b09755d656d92b61de00690f3d2e052a537b0a31)
- added google drive sync [`0dc2c9d`](https://github.com/karmaniverous/entity-manager/commit/0dc2c9d598347b180ead1e0edf99379967bb6486)

#### [v6.14.0](https://github.com/karmaniverous/entity-manager/compare/v6.13.3...v6.14.0)

> 14 November 2024

- reorganized repo [`56973aa`](https://github.com/karmaniverous/entity-manager/commit/56973aa7eedbbd0e433b99b2a13694b816263f00)
- chore: release v6.14.0 [`b2b635a`](https://github.com/karmaniverous/entity-manager/commit/b2b635a7c486e6f3db6a3064bc4465c95f091b59)
- Overloaded methods for array handling. [`3f1bdb1`](https://github.com/karmaniverous/entity-manager/commit/3f1bdb15b2c171ce572afd6448aabb137d232238)
- updated docs [`1e2810f`](https://github.com/karmaniverous/entity-manager/commit/1e2810f720ed22f51f738a3c395a22cb6b5dbb1d)

#### [v6.13.3](https://github.com/karmaniverous/entity-manager/compare/v6.13.2...v6.13.3)

> 14 November 2024

- updated docs [`23fa87a`](https://github.com/karmaniverous/entity-manager/commit/23fa87aac24e16780c51d4aef6395a60ca3fcdd8)
- updated docs [`82faeda`](https://github.com/karmaniverous/entity-manager/commit/82faeda1a97d1244aaa72122f79f350f4f774d22)
- chore: release v6.13.3 [`a349a56`](https://github.com/karmaniverous/entity-manager/commit/a349a569c223811ace62d1de479833415972aec8)
- updated dependencies [`d9d9f6a`](https://github.com/karmaniverous/entity-manager/commit/d9d9f6ae881dd3c32a1b4cb365b460a938066788)
- updated comments [`8d05e53`](https://github.com/karmaniverous/entity-manager/commit/8d05e5396e9128db084dbf4eda4b10bfc0fab302)

#### [v6.13.2](https://github.com/karmaniverous/entity-manager/compare/v6.13.1...v6.13.2)

> 13 November 2024

- chore: release v6.13.2 [`eaf9b41`](https://github.com/karmaniverous/entity-manager/commit/eaf9b41ed432f053de267379cfd7a7091e4b2d70)
- allow empty index projections array [`4a46fc7`](https://github.com/karmaniverous/entity-manager/commit/4a46fc7e09c676cd08c04173dce36e766254b1e7)
- updated tests [`59359f1`](https://github.com/karmaniverous/entity-manager/commit/59359f1ff249fdc70c1f428a268622c752bd24eb)

#### [v6.13.1](https://github.com/karmaniverous/entity-manager/compare/v6.13.0...v6.13.1)

> 13 November 2024

- chore: release v6.13.1 [`c1123b0`](https://github.com/karmaniverous/entity-manager/commit/c1123b0887879a6f8d4fd47547b2e9602dca3451)
- improved findIndexToken [`a7fd6a8`](https://github.com/karmaniverous/entity-manager/commit/a7fd6a8d1bf12f16e6a4330c469242fc2536c612)

#### [v6.13.0](https://github.com/karmaniverous/entity-manager/compare/v6.12.0...v6.13.0)

> 13 November 2024

- chore: release v6.13.0 [`aac5f63`](https://github.com/karmaniverous/entity-manager/commit/aac5f630657dd3f6be8798a9f0e7db31ac55233e)
- added encodeGeneratedProperty [`28a2a0b`](https://github.com/karmaniverous/entity-manager/commit/28a2a0bab142142412d6db54899a129c139cbcf3)

#### [v6.12.0](https://github.com/karmaniverous/entity-manager/compare/v6.11.4...v6.12.0)

> 13 November 2024

- chore: release v6.12.0 [`f4cf612`](https://github.com/karmaniverous/entity-manager/commit/f4cf6126d623f6c305f713413eb32635ba38258d)
- Added findIndexToken [`d7bf77a`](https://github.com/karmaniverous/entity-manager/commit/d7bf77a95ceed1881aab34df6856477e0f2a9f79)

#### [v6.11.4](https://github.com/karmaniverous/entity-manager/compare/v6.11.2...v6.11.4)

> 12 November 2024

- updated docs [`7e3eedd`](https://github.com/karmaniverous/entity-manager/commit/7e3eedd160278872d4a5cd146727fbe99d0fbf0b)
- chore: release v6.11.4 [`0936bce`](https://github.com/karmaniverous/entity-manager/commit/0936bcee15d7760a4f7ce4e4e207ac86cace6a40)
- improved type handling [`1356a12`](https://github.com/karmaniverous/entity-manager/commit/1356a127492aede479b82e861f1d3af3ec25b3fd)

#### [v6.11.2](https://github.com/karmaniverous/entity-manager/compare/v6.11.1...v6.11.2)

> 12 November 2024

- chore: release v6.11.2 [`de76ccb`](https://github.com/karmaniverous/entity-manager/commit/de76ccb8b630319858fe91c3bee888ee5c1888ae)
- updated dependencies [`c7c77cf`](https://github.com/karmaniverous/entity-manager/commit/c7c77cfc97eaec0f146d345bf80715bdfeae0ee7)

#### [v6.11.1](https://github.com/karmaniverous/entity-manager/compare/v6.11.0...v6.11.1)

> 12 November 2024

- chore: release v6.11.1 [`8269dad`](https://github.com/karmaniverous/entity-manager/commit/8269dada4637faab895c7c398860ee7ce002fca0)
- updated dependencies [`8c598e1`](https://github.com/karmaniverous/entity-manager/commit/8c598e1e7722e4ad5ac2f905e15efc6345db5c58)

#### [v6.11.0](https://github.com/karmaniverous/entity-manager/compare/v6.10.3...v6.11.0)

> 12 November 2024

- chore: release v6.11.0 [`3c58a56`](https://github.com/karmaniverous/entity-manager/commit/3c58a562d7b38ee519b9a7b614c59bf0829b4bfc)
- added getPrimaryKey method [`0bef165`](https://github.com/karmaniverous/entity-manager/commit/0bef16511fc4f23e5701f1a4e238b068f4e3832e)

#### [v6.10.3](https://github.com/karmaniverous/entity-manager/compare/v6.10.2...v6.10.3)

> 12 November 2024

- integrated entityManager param with BaseEntityClientOptions [`6659766`](https://github.com/karmaniverous/entity-manager/commit/6659766c8c1d153475900be40cdbd92cf4b745e3)
- chore: release v6.10.3 [`a8307f7`](https://github.com/karmaniverous/entity-manager/commit/a8307f7fb6fb1c867dda8f89799a92366217348f)

#### [v6.10.2](https://github.com/karmaniverous/entity-manager/compare/v6.10.1...v6.10.2)

> 12 November 2024

- chore: release v6.10.2 [`456aaba`](https://github.com/karmaniverous/entity-manager/commit/456aaba62a6baf36af291ebd05bff87a393182df)
- Added EntityKey & EntityRecord [`42887ca`](https://github.com/karmaniverous/entity-manager/commit/42887caf91089068af1abbff293c0da31c278420)

#### [v6.10.1](https://github.com/karmaniverous/entity-manager/compare/v6.10.0...v6.10.1)

> 12 November 2024

- Add EntityManager as EntityClient property [`d7a37f9`](https://github.com/karmaniverous/entity-manager/commit/d7a37f9128ec796b1b3405edd6d198a7fbaf7d45)
- chore: release v6.10.1 [`64367b7`](https://github.com/karmaniverous/entity-manager/commit/64367b7f349320cf1649480f62a75cc4d079950e)
- removed obsolete files [`6bec050`](https://github.com/karmaniverous/entity-manager/commit/6bec050504374afb49da7a52cf87e1ad9f54d5a9)

#### [v6.10.0](https://github.com/karmaniverous/entity-manager/compare/v6.9.2...v6.10.0)

> 11 November 2024

- Added EntityItemize [`921ed45`](https://github.com/karmaniverous/entity-manager/commit/921ed45583fa80958bad6f2500ef6b1184974a22)
- chore: release v6.10.0 [`62f04dc`](https://github.com/karmaniverous/entity-manager/commit/62f04dcb22b239fe4f24ffa0d250ef975cd651e5)

#### [v6.9.2](https://github.com/karmaniverous/entity-manager/compare/v6.9.1...v6.9.2)

> 11 November 2024

- chore: release v6.9.2 [`65e2532`](https://github.com/karmaniverous/entity-manager/commit/65e25327432f7324a6512da175b510057f5f578a)
- improved default type params [`8c03cad`](https://github.com/karmaniverous/entity-manager/commit/8c03cad5015c2c3a5137ebc661663724f701b075)

#### [v6.9.1](https://github.com/karmaniverous/entity-manager/compare/v6.9.0...v6.9.1)

> 11 November 2024

- chore: release v6.9.1 [`c3c66a0`](https://github.com/karmaniverous/entity-manager/commit/c3c66a094f89ef1b63e6f5a949c32396c065385d)
- exploited PageKey type [`830c259`](https://github.com/karmaniverous/entity-manager/commit/830c259df9ad4c1017e0d592491197d73dae2f3a)

#### [v6.9.0](https://github.com/karmaniverous/entity-manager/compare/v6.8.1...v6.9.0)

> 11 November 2024

- Added PageKey type [`5aa39b0`](https://github.com/karmaniverous/entity-manager/commit/5aa39b081221882172226236edf24c4d5dc2c098)
- chore: release v6.9.0 [`66311a6`](https://github.com/karmaniverous/entity-manager/commit/66311a6d34aae70656d9ed9f51469ffe79ac2bea)

#### [v6.8.1](https://github.com/karmaniverous/entity-manager/compare/v6.8.0...v6.8.1)

> 11 November 2024

- updated docs & eliminated PartialTranscodable [`6599ad6`](https://github.com/karmaniverous/entity-manager/commit/6599ad6d622ac8d6e917772c73b5bd4de6020669)
- chore: release v6.8.1 [`7e7de9a`](https://github.com/karmaniverous/entity-manager/commit/7e7de9a6a8098e7951f749b6c8303dd7b0347c74)
- updated docs & dependencies [`014e5a8`](https://github.com/karmaniverous/entity-manager/commit/014e5a899cd2ade76d365ef68a287885543858c5)
- readme update [`6136185`](https://github.com/karmaniverous/entity-manager/commit/6136185fb2ecad0ba79f6b08735647822e4d3f39)

#### [v6.8.0](https://github.com/karmaniverous/entity-manager/compare/v6.7.5...v6.8.0)

> 10 November 2024

- refactored config object [`a6c333f`](https://github.com/karmaniverous/entity-manager/commit/a6c333f3e3b115d90bd247ff89d9d9dc9a67d7b3)
- wip config refactor [`f631039`](https://github.com/karmaniverous/entity-manager/commit/f631039f8bcf7cce75959ebe008cd7a03a7555dd)
- collapsed type params [`9655b4d`](https://github.com/karmaniverous/entity-manager/commit/9655b4d808dcb7b444056092adec309f2bae63df)
- chore: release v6.8.0 [`dda72b0`](https://github.com/karmaniverous/entity-manager/commit/dda72b0c90a3c13a20f7a5b38f31f3e813690fb8)
- updated docs [`c2d77d1`](https://github.com/karmaniverous/entity-manager/commit/c2d77d1784e0819e28d8f50362ec1ca466b1abc5)
- simplified type params [`5f07347`](https://github.com/karmaniverous/entity-manager/commit/5f07347ee8b20d7a9e4964f11e2862ce44ae284d)
- simplified config type params [`dd560f4`](https://github.com/karmaniverous/entity-manager/commit/dd560f4f876fecd04ce809b7b2fffbe10a5c863d)
- permit unknown properties on EntityItem [`93eccf2`](https://github.com/karmaniverous/entity-manager/commit/93eccf2158dc7bdcee9d55b7e7a05719cd8bae99)
- eliminated redundant file [`3018bb1`](https://github.com/karmaniverous/entity-manager/commit/3018bb178eaaac99439d70f5e3615ed4137a42bb)
- updated docs [`45f527b`](https://github.com/karmaniverous/entity-manager/commit/45f527bbce287b8e64fe9a5e19223fa9343a25a5)

#### [v6.7.5](https://github.com/karmaniverous/entity-manager/compare/v6.7.4...v6.7.5)

> 8 November 2024

- chore: release v6.7.5 [`a113d8e`](https://github.com/karmaniverous/entity-manager/commit/a113d8e6a604fc83a0d189552efc15e164279936)
- Refactored ShardQueryMapBuilder to QueryBuilder [`d115cb6`](https://github.com/karmaniverous/entity-manager/commit/d115cb65085be7d0f52400019bfcdd9ecccb8d8e)

#### [v6.7.4](https://github.com/karmaniverous/entity-manager/compare/v6.7.3...v6.7.4)

> 8 November 2024

- chore: release v6.7.4 [`a0aa05e`](https://github.com/karmaniverous/entity-manager/commit/a0aa05eeaa0f141f5cb1e760aef6561ca2b54d14)
- added BaseEntityClient [`e95e645`](https://github.com/karmaniverous/entity-manager/commit/e95e64568ec2d7dbacaebdd2e03f173adf6c6293)

#### [v6.7.3](https://github.com/karmaniverous/entity-manager/compare/v6.7.2...v6.7.3)

> 7 November 2024

- chore: release v6.7.3 [`c5f0f6a`](https://github.com/karmaniverous/entity-manager/commit/c5f0f6a75f42802314116f60f70d08c2314409d0)
- Objectified options [`9640e0f`](https://github.com/karmaniverous/entity-manager/commit/9640e0f11631bf2995bcf74a91e8dbf23d82b9f1)

#### [v6.7.2](https://github.com/karmaniverous/entity-manager/compare/v6.7.1...v6.7.2)

> 7 November 2024

- chore: release v6.7.2 [`ace2c15`](https://github.com/karmaniverous/entity-manager/commit/ace2c159689f39b2dfeeceed9cf278eda202d769)
- added query method to BaseSHardQueryMapBuilder [`bf3a4fd`](https://github.com/karmaniverous/entity-manager/commit/bf3a4fda5fbff2ab6b605fe7954c7fff2ab8911a)

#### [v6.7.1](https://github.com/karmaniverous/entity-manager/compare/v6.7.0...v6.7.1)

> 7 November 2024

- wip resolving page key issues [`51331b9`](https://github.com/karmaniverous/entity-manager/commit/51331b9f4cd0228d0fda84aaf9e95ddf04b35ee9)
- update dependencies & build script [`8012862`](https://github.com/karmaniverous/entity-manager/commit/80128628b372bdba0a0c8f24ea52de876d67466b)
- rationalized query options [`bc2ce78`](https://github.com/karmaniverous/entity-manager/commit/bc2ce7848f19322400cfe9aca34961c59606408c)
- chore: release v6.7.1 [`9528550`](https://github.com/karmaniverous/entity-manager/commit/9528550a5c4cfed2b7a9e1508c2030ebd04ce124)
- resolved page key issues [`34d19ce`](https://github.com/karmaniverous/entity-manager/commit/34d19ce0927f13590c6f5da25ab1d9a4c626c67f)

#### [v6.7.0](https://github.com/karmaniverous/entity-manager/compare/v6.6.0...v6.7.0)

> 5 November 2024

- Added BaseShardQueryMapBuilder [`ceae101`](https://github.com/karmaniverous/entity-manager/commit/ceae101c20ca0ec5837273ecad35c47e43e92953)
- chore: release v6.7.0 [`2aff01b`](https://github.com/karmaniverous/entity-manager/commit/2aff01b0a8756c191eec2b28cbce54c7b0f7ca95)

#### [v6.6.0](https://github.com/karmaniverous/entity-manager/compare/v6.5.1...v6.6.0)

> 4 November 2024

- rationalized function parameters [`2d03112`](https://github.com/karmaniverous/entity-manager/commit/2d031129ff2dbc6d9fa57974da05445ad3fecf1c)
- chore: release v6.6.0 [`52ae593`](https://github.com/karmaniverous/entity-manager/commit/52ae593d069a78ab4b1bedcab2011ff901d55680)
- updated docs [`2853443`](https://github.com/karmaniverous/entity-manager/commit/285344353109edf4a4182c6586da240ebddf5d04)
- updated docs [`ebf8b36`](https://github.com/karmaniverous/entity-manager/commit/ebf8b36a6a0aef27a79bc44d1a0a93e2a60aae50)

#### [v6.5.1](https://github.com/karmaniverous/entity-manager/compare/v6.5.0...v6.5.1)

> 2 November 2024

- refactored indexes for explicit hash & range keys [`0e51596`](https://github.com/karmaniverous/entity-manager/commit/0e51596918a29690ce74345ca8a1f1be82eabe11)
- refactored indexes for explicit hash & range keys [`37534ab`](https://github.com/karmaniverous/entity-manager/commit/37534ab1d46f234df5506e626f0fef24b03cff8d)
- chore: release v6.5.1 [`80a65c8`](https://github.com/karmaniverous/entity-manager/commit/80a65c8d1b7c62c0881a3b09f10cd957d3e7effa)
- test bugfix [`f2b8757`](https://github.com/karmaniverous/entity-manager/commit/f2b8757485e96ef59b7b5321568a63fca2e3d581)
- extended test timeout [`e7c514b`](https://github.com/karmaniverous/entity-manager/commit/e7c514b833113434ee63d83e366e7743fa5cb689)

#### [v6.5.0](https://github.com/karmaniverous/entity-manager/compare/v6.4.10...v6.5.0)

> 2 November 2024

- added index projection support [`ef88d83`](https://github.com/karmaniverous/entity-manager/commit/ef88d83b3691d7f3cdf6c6a6013afc5a5457d6f3)
- chore: release v6.5.0 [`7d7e82d`](https://github.com/karmaniverous/entity-manager/commit/7d7e82d6bac0c93d5b7a1298a5b96f5e1c39b29c)
- updated docs [`7d4b25c`](https://github.com/karmaniverous/entity-manager/commit/7d4b25ca3bc97dca1e78e11b72680149ce746a15)

#### [v6.4.10](https://github.com/karmaniverous/entity-manager/compare/v6.4.9...v6.4.10)

> 29 October 2024

- rationalized external documentation [`275af19`](https://github.com/karmaniverous/entity-manager/commit/275af19ccd81e739c76dfd9a11edde43d8116c5b)
- chore: release v6.4.10 [`d5b9303`](https://github.com/karmaniverous/entity-manager/commit/d5b930374232bb26c7ac0c70f3ca049ba8fa4c6f)
- lintfix [`b0d94a6`](https://github.com/karmaniverous/entity-manager/commit/b0d94a624e5e017b38660fcfedd4e42d508d4e2d)

#### [v6.4.9](https://github.com/karmaniverous/entity-manager/compare/v6.4.8...v6.4.9)

> 28 October 2024

- chore: release v6.4.9 [`a8f5310`](https://github.com/karmaniverous/entity-manager/commit/a8f5310051915376c5bb0b2689925780fb663a63)
- re-export Nil from entity-tools [`91e5412`](https://github.com/karmaniverous/entity-manager/commit/91e541209fd35e386afc7eeaf023874ffa622cab)

#### [v6.4.8](https://github.com/karmaniverous/entity-manager/compare/v6.4.7...v6.4.8)

> 28 October 2024

- removed BaseShardQueryMapBuilder class [`4570991`](https://github.com/karmaniverous/entity-manager/commit/4570991bf6234907c14530d04f3f4b3b0663967e)
- chore: release v6.4.8 [`a64ed13`](https://github.com/karmaniverous/entity-manager/commit/a64ed134b99a2a0cef3e084f6a64c82dd515e77b)

#### [v6.4.7](https://github.com/karmaniverous/entity-manager/compare/v6.4.6...v6.4.7)

> 27 October 2024

- updated base class names [`92c27bd`](https://github.com/karmaniverous/entity-manager/commit/92c27bdffe43f658a723dc88428cf425af283d0f)
- chore: release v6.4.7 [`b99014b`](https://github.com/karmaniverous/entity-manager/commit/b99014b7b5d2078e896882dd55815ea2c2faf34d)

#### [v6.4.6](https://github.com/karmaniverous/entity-manager/compare/v6.4.5...v6.4.6)

> 27 October 2024

- chore: release v6.4.6 [`6672779`](https://github.com/karmaniverous/entity-manager/commit/667277994d25cd7629f3fdc59190e7203af5d5d1)
- extend options [`1a956a4`](https://github.com/karmaniverous/entity-manager/commit/1a956a4e8bae6390b2868ad2c093a8304b60a8b8)

#### [v6.4.5](https://github.com/karmaniverous/entity-manager/compare/v6.4.4...v6.4.5)

> 27 October 2024

- chore: release v6.4.5 [`ea84b76`](https://github.com/karmaniverous/entity-manager/commit/ea84b765da56d74b6dd364eaf7c8e699a3691e6c)
- removed item from shard query map builder options [`5630b29`](https://github.com/karmaniverous/entity-manager/commit/5630b29d84794ece4a014f3799e82796e8a3f43e)

#### [v6.4.4](https://github.com/karmaniverous/entity-manager/compare/v6.4.3...v6.4.4)

> 26 October 2024

- added injectable logger support [`e2633bd`](https://github.com/karmaniverous/entity-manager/commit/e2633bd06ed56ad7b55ce628854d1bd3fee77188)
- chore: release v6.4.4 [`cdfa453`](https://github.com/karmaniverous/entity-manager/commit/cdfa4538e68808531ae5d77476edc34cb072ad46)
- eliminated EntityManagerClient base class [`f6cd8e5`](https://github.com/karmaniverous/entity-manager/commit/f6cd8e53e34374e3a78b248c820d2d8f7af4f778)
- Refactored ShardQueryFunction & related type params [`3c66c86`](https://github.com/karmaniverous/entity-manager/commit/3c66c863594429c9e2e9c3fcceaebeb874ebb7d4)
- rationalize type params [`254f2a5`](https://github.com/karmaniverous/entity-manager/commit/254f2a57045331d47ff657cc6aeedb1b1af4f301)

#### [v6.4.3](https://github.com/karmaniverous/entity-manager/compare/v6.4.2...v6.4.3)

> 9 October 2024

- chore: release v6.4.3 [`43161fd`](https://github.com/karmaniverous/entity-manager/commit/43161fdde0898e24a1cf26970ab2b32e2de59407)
- export new types [`50f40dc`](https://github.com/karmaniverous/entity-manager/commit/50f40dce377a69f646ce58dc0a75bf6fab1be417)

#### [v6.4.2](https://github.com/karmaniverous/entity-manager/compare/v6.4.1...v6.4.2)

> 9 October 2024

- chore: release v6.4.2 [`556100c`](https://github.com/karmaniverous/entity-manager/commit/556100cc13aba74eadec8a0a49cb80824afa876d)
- Abstracted out EntityManager from ShardQueryMapBuilder [`8266b27`](https://github.com/karmaniverous/entity-manager/commit/8266b27f80800a168a8345a81f3f9e2a635d873d)

#### [v6.4.1](https://github.com/karmaniverous/entity-manager/compare/v6.4.0...v6.4.1)

> 9 October 2024

- chore: release v6.4.1 [`b0c436d`](https://github.com/karmaniverous/entity-manager/commit/b0c436d6cd2c5572c3e0d07cfb39387ca6b2e12c)
- made options public [`e7088fe`](https://github.com/karmaniverous/entity-manager/commit/e7088fe73650168e420106513a130d3d27301e28)

#### [v6.4.0](https://github.com/karmaniverous/entity-manager/compare/v6.3.1...v6.4.0)

> 9 October 2024

- non-mutating methods on partial items [`5b09049`](https://github.com/karmaniverous/entity-manager/commit/5b09049fcf663099f2524c92a67f5389773d1aaf)
- chore: release v6.4.0 [`4aca9ff`](https://github.com/karmaniverous/entity-manager/commit/4aca9ff1567a863cad9e92ca93a4d83f6c39e4d4)

#### [v6.3.1](https://github.com/karmaniverous/entity-manager/compare/v6.3.0...v6.3.1)

> 9 October 2024

- chore: release v6.3.1 [`2526e46`](https://github.com/karmaniverous/entity-manager/commit/2526e46ed8126f2a714d2674806acafd81472d4c)
- Allow addKeys to work on partial Item [`ddd60bd`](https://github.com/karmaniverous/entity-manager/commit/ddd60bd508766ca6cafded0746359fa0aa645bc9)
- apply removeKeys to partial item [`f8d74c9`](https://github.com/karmaniverous/entity-manager/commit/f8d74c9f99ae94b5747668b90407a1a459458c98)

#### [v6.3.0](https://github.com/karmaniverous/entity-manager/compare/v6.2.4...v6.3.0)

> 9 October 2024

- Refactored QueryFunctionBuilder to QueryMapBuilder [`6c27dca`](https://github.com/karmaniverous/entity-manager/commit/6c27dca5a2a290b1e5157a5e0f20112962dcd129)
- chore: release v6.3.0 [`6c1f0e7`](https://github.com/karmaniverous/entity-manager/commit/6c1f0e708779baf3cf0ff4c6bc0ff8c52924acf5)
- lintfix [`e36fcb0`](https://github.com/karmaniverous/entity-manager/commit/e36fcb0659c7451202f552319c12be05b2f3993c)

#### [v6.2.4](https://github.com/karmaniverous/entity-manager/compare/v6.2.3...v6.2.4)

> 8 October 2024

- chore: release v6.2.4 [`bead3d1`](https://github.com/karmaniverous/entity-manager/commit/bead3d1420c62304dfaf2d1cecf614044aea3d1d)
- bugfix [`45db0ea`](https://github.com/karmaniverous/entity-manager/commit/45db0ea70e9a3a0de943b30613b53417f717446c)

#### [v6.2.3](https://github.com/karmaniverous/entity-manager/compare/v6.2.2...v6.2.3)

> 8 October 2024

- chore: release v6.2.3 [`0343acc`](https://github.com/karmaniverous/entity-manager/commit/0343accd697344522a3eb0a8c052538b96ef11e2)
- bugfix [`744d263`](https://github.com/karmaniverous/entity-manager/commit/744d2633300d65abc9aecd3b2f6065f8b21bbc3e)

#### [v6.2.2](https://github.com/karmaniverous/entity-manager/compare/v6.2.1...v6.2.2)

> 8 October 2024

- chore: release v6.2.2 [`03db4c0`](https://github.com/karmaniverous/entity-manager/commit/03db4c0da8252a78578c0a4eeda1b01022c9cab9)
- Refactored to PartialTranscodable [`772b26a`](https://github.com/karmaniverous/entity-manager/commit/772b26ae42edc2d363a088627fcf7ed0b5752291)
- bugfix [`1192bcc`](https://github.com/karmaniverous/entity-manager/commit/1192bccccb0acc1232088d3b9e876aa49ffcde60)
- update exports [`af19fe8`](https://github.com/karmaniverous/entity-manager/commit/af19fe8ac58b47f8a0f65911eb974cf66aec8a0b)

#### [v6.2.1](https://github.com/karmaniverous/entity-manager/compare/v6.2.0...v6.2.1)

> 8 October 2024

- chore: release v6.2.1 [`c58bb3f`](https://github.com/karmaniverous/entity-manager/commit/c58bb3fdf4bf5706226b39150d618e7a31e119af)
- export Exactify [`c7cf25d`](https://github.com/karmaniverous/entity-manager/commit/c7cf25d321f11c53d6feaf1212636d3b9eb294aa)

#### [v6.2.0](https://github.com/karmaniverous/entity-manager/compare/v6.1.2...v6.2.0)

> 8 October 2024

- Added ShardQueryFunctionBuilder base class [`3e3b51f`](https://github.com/karmaniverous/entity-manager/commit/3e3b51f0c9c9772a696faab398fedbae20e020be)
- chore: release v6.2.0 [`80f6dd4`](https://github.com/karmaniverous/entity-manager/commit/80f6dd4d2cb73351f38cbaadcbbf1ade3cd98db3)
- updated docs [`1bc5066`](https://github.com/karmaniverous/entity-manager/commit/1bc50667d7ffa05d57f566ca2e2c1d1168aa5291)

#### [v6.1.2](https://github.com/karmaniverous/entity-manager/compare/v6.1.1...v6.1.2)

> 7 October 2024

- chore: release v6.1.2 [`77a5e2e`](https://github.com/karmaniverous/entity-manager/commit/77a5e2ef61807134256cffe800d6c6dddae9a71a)
- updated getUnprocessedItems type [`971defd`](https://github.com/karmaniverous/entity-manager/commit/971defdc57e226d08adb0c8c1d4c78ee20cb7c37)

#### [v6.1.1](https://github.com/karmaniverous/entity-manager/compare/v6.1.0...v6.1.1)

> 7 October 2024

- chore: release v6.1.1 [`090af5a`](https://github.com/karmaniverous/entity-manager/commit/090af5ad3c6b9a0c24912428321ed6a4c421fe21)
- added batchExecute [`246e164`](https://github.com/karmaniverous/entity-manager/commit/246e16402b728c45051b98dcbb4caef7e6fd4cbd)

#### [v6.1.0](https://github.com/karmaniverous/entity-manager/compare/v6.1.0-6...v6.1.0)

> 7 October 2024

- chore: release v6.1.0 [`0e1705b`](https://github.com/karmaniverous/entity-manager/commit/0e1705bfee4ad2b798563d3e2e41671d69125f3e)
- updated rollup config [`8aed42c`](https://github.com/karmaniverous/entity-manager/commit/8aed42cfa8b4500d2d600b7baaacc247803a756d)
- updated dependencies [`76811ad`](https://github.com/karmaniverous/entity-manager/commit/76811add9c5c2acdfbbb454d18ee91b0c9359847)

#### [v6.1.0-6](https://github.com/karmaniverous/entity-manager/compare/v6.1.0-5...v6.1.0-6)

> 7 October 2024

- chore: release v6.1.0-6 [`5eda259`](https://github.com/karmaniverous/entity-manager/commit/5eda259aaaf41e27468bd1f7f0b6fd9fa40c981c)
- added external dependencies [`613f7e3`](https://github.com/karmaniverous/entity-manager/commit/613f7e3fc3f450e96912b411edb064af9e8bfcec)

#### [v6.1.0-5](https://github.com/karmaniverous/entity-manager/compare/v6.1.0-4...v6.1.0-5)

> 7 October 2024

- chore: release v6.1.0-5 [`4c21315`](https://github.com/karmaniverous/entity-manager/commit/4c21315402e8465fedc41821061d1c33e768aec7)
- fixed type entry points [`4d9b080`](https://github.com/karmaniverous/entity-manager/commit/4d9b08091ca0ef445f0411ab837e4fd18899adcf)

#### [v6.1.0-4](https://github.com/karmaniverous/entity-manager/compare/v6.1.0-3...v6.1.0-4)

> 7 October 2024

- updated dependencies [`cc9d5ad`](https://github.com/karmaniverous/entity-manager/commit/cc9d5ada71f3dd8fef9f5ae5a86a130ef9a30f15)
- chore: release v6.1.0-4 [`ad0700c`](https://github.com/karmaniverous/entity-manager/commit/ad0700c13f0f7e83ccd432cf5e4ae494206fe6df)
- fixed plugin presentation [`c7ddb52`](https://github.com/karmaniverous/entity-manager/commit/c7ddb5213b31cfa48668bc254ceb30865816ad97)

#### [v6.1.0-3](https://github.com/karmaniverous/entity-manager/compare/v6.1.0-2...v6.1.0-3)

> 7 October 2024

- chore: release v6.1.0-3 [`be67eb3`](https://github.com/karmaniverous/entity-manager/commit/be67eb3d12c6caf5ae4e508d76068677dddbf397)
- updated module entry paths [`b246f37`](https://github.com/karmaniverous/entity-manager/commit/b246f3785e49ddc755849db19e1b9b082780c8da)

#### [v6.1.0-2](https://github.com/karmaniverous/entity-manager/compare/v6.1.0-1...v6.1.0-2)

> 7 October 2024

- chore: release v6.1.0-2 [`6690429`](https://github.com/karmaniverous/entity-manager/commit/6690429dda02e6149508bb5d46ca757ccdc100ee)
- added WithRequiredAndNonNullable [`6322ef7`](https://github.com/karmaniverous/entity-manager/commit/6322ef73259a1448fe5df9cbf1c7e326b3960653)

#### [v6.1.0-1](https://github.com/karmaniverous/entity-manager/compare/v6.1.0-0...v6.1.0-1)

> 7 October 2024

- chore: release v6.1.0-1 [`8d11a35`](https://github.com/karmaniverous/entity-manager/commit/8d11a3537a61ac4020f712d482c5a35d12ca068b)
- improved option handling [`07a5f65`](https://github.com/karmaniverous/entity-manager/commit/07a5f65194d9b935f024f199e212238cdc92051e)
- rationalized base/child options [`dcddb73`](https://github.com/karmaniverous/entity-manager/commit/dcddb73ca70f3ec94516645967fe441942c4cb78)

#### [v6.1.0-0](https://github.com/karmaniverous/entity-manager/compare/v6.0.1...v6.1.0-0)

> 7 October 2024

- wip abstract client base class [`1bfc212`](https://github.com/karmaniverous/entity-manager/commit/1bfc21299e61c98596d6154cd3b8260def499dda)
- chore: release v6.1.0-0 [`9881fac`](https://github.com/karmaniverous/entity-manager/commit/9881fac08fc264f29cb91092b1818643cfdda28c)

#### [v6.0.1](https://github.com/karmaniverous/entity-manager/compare/v6.0.0...v6.0.1)

> 1 October 2024

- updated docs [`42e69a6`](https://github.com/karmaniverous/entity-manager/commit/42e69a647f916a2df5146af20342e70063baa821)
- updated docs [`6b4651a`](https://github.com/karmaniverous/entity-manager/commit/6b4651afde41aa9a300a8b2440256287b50f3682)
- updated docs [`d7f1064`](https://github.com/karmaniverous/entity-manager/commit/d7f106465115b0c32bbac3267efcc3a66cc07947)
- updated docs [`942a310`](https://github.com/karmaniverous/entity-manager/commit/942a310b77b871e224b40e6c97d9638a39b54cd2)
- renamed entityTypes to entityTranscodes [`f66d519`](https://github.com/karmaniverous/entity-manager/commit/f66d519389e721f8a1deb60d94b94005c0216bca)
- chore: release v6.0.1 [`e84d582`](https://github.com/karmaniverous/entity-manager/commit/e84d5821bb74951f923744850bcb3b4861c3b1f8)
- updated docs [`d26ac43`](https://github.com/karmaniverous/entity-manager/commit/d26ac43161560b9bfac105023888b15a36b03364)
- updated docs [`e917720`](https://github.com/karmaniverous/entity-manager/commit/e917720d0870c7176c6394cfc25bfa7c76d36c1a)
- moved docs [`8698104`](https://github.com/karmaniverous/entity-manager/commit/8698104b9a4ff2eb157158efb7c1043d44faa61a)
- updated docs [`f210611`](https://github.com/karmaniverous/entity-manager/commit/f2106110fef3dd4efbc11e6fafa6e52f956d1c29)
- updated package description [`35c0fd3`](https://github.com/karmaniverous/entity-manager/commit/35c0fd35ac29dff16ff8cb5987e9c31c31560629)
- Delete CNAME [`88af121`](https://github.com/karmaniverous/entity-manager/commit/88af121ed4cd919aabd0056d0ebbf2a9ac98e788)
- Create CNAME [`6cca256`](https://github.com/karmaniverous/entity-manager/commit/6cca256f289cd3e8787a9ef3a10c49ebc3fa7e30)

### [v6.0.0](https://github.com/karmaniverous/entity-manager/compare/v5.0.9...v6.0.0)

> 17 September 2024

- Feature/gh-2-typescript-refactor [`#3`](https://github.com/karmaniverous/entity-manager/pull/3)
- [GH-2] finished refactor, all tests passing! [`acfb8f0`](https://github.com/karmaniverous/entity-manager/commit/acfb8f0bb190ebe810f376bdc44d044ffb03e19d)
- [GH-2] wip updating for changes in entity-tools & mock-db [`0560dc8`](https://github.com/karmaniverous/entity-manager/commit/0560dc8d80cf9dce4c4dcf65ecfc6d69146fa756)
- [GH-2] wip [`3fbeb5e`](https://github.com/karmaniverous/entity-manager/commit/3fbeb5ee17f73a54ac624e4c8114794d0731bfa8)
- [GH-2] wip - synced with ts project template [`9852189`](https://github.com/karmaniverous/entity-manager/commit/9852189431ba26878f7a271db690c64c49144a9e)
- [GH-2] wip typedoc [`a6fd075`](https://github.com/karmaniverous/entity-manager/commit/a6fd075e6bb5b423426a30c31436da02b2c8b19f)
- [GH-2] wip typescript refactor got all tests to pass [`861dfe5`](https://github.com/karmaniverous/entity-manager/commit/861dfe575165d730dc09d7f41b6c14dca6bb5868)
- [GH-2] refactored docs [`446635e`](https://github.com/karmaniverous/entity-manager/commit/446635e47400bd42a64269239da8578ed34d8f45)
- [GH-2] refactored file names & finished updateItemHashKey [`387bf7d`](https://github.com/karmaniverous/entity-manager/commit/387bf7dcbb477437b79ff49a0b30bf9837d55b39)
- [GH-2] Added dedupe & sort to query [`8713d61`](https://github.com/karmaniverous/entity-manager/commit/8713d61570de5f13d515296b6e3c72e6040a7848)
- [GH-2] refactored for changes in eneity tools & MockDb [`b18487f`](https://github.com/karmaniverous/entity-manager/commit/b18487f64cf4a6ebebe96ed8cd2e3bada94a0566)
- chore: release v6.0.0 [`12011f1`](https://github.com/karmaniverous/entity-manager/commit/12011f143cd7e1155f18984d7b169fa5e4c17b33)
- [GH-2] updated query & added support for page key map compression [`212e3c2`](https://github.com/karmaniverous/entity-manager/commit/212e3c246269ef577e4a31b1c38e2953a7deffe7)
- [GH-2] refactored test files [`57f4672`](https://github.com/karmaniverous/entity-manager/commit/57f467274324b57763b9df8184632834590b2d79)
- [GH-2] refactored file names & updated ParsedConfig tests [`4fb4ee6`](https://github.com/karmaniverous/entity-manager/commit/4fb4ee603b3952fa601047d941f441d142b6d41b)
- [GH-2] abstracted out types & private methods [`5508063`](https://github.com/karmaniverous/entity-manager/commit/5508063462ad51fbc1a85b6c10294a299f00ceb2)
- [GH-2] rationalized documentation [`4de4582`](https://github.com/karmaniverous/entity-manager/commit/4de45825d3c51ea23f292d00ce306b94a12d9ca4)
- [GH-2] rationalized types & params and updated docs [`c87ef5f`](https://github.com/karmaniverous/entity-manager/commit/c87ef5f658cb2574e23393705595b8557d8d75d5)
- [GH-2] wip refactoring tests [`650faa2`](https://github.com/karmaniverous/entity-manager/commit/650faa2f5b3ee7e91f4ccf9af53fc934550920b6)
- [GH-2] wip typescript [`9f84632`](https://github.com/karmaniverous/entity-manager/commit/9f8463257d1a26d72616cd3f4e9b0e7e8c4fafa7)
- [GH-2] rationalized query behavior [`81741a5`](https://github.com/karmaniverous/entity-manager/commit/81741a50ce6682e2d5e70c07275a94a7e0775b92)
- [GH-2] added error handling & update/strip generated keys [`6678676`](https://github.com/karmaniverous/entity-manager/commit/6678676df72eb6dfedab13fd42c7523d01de570f)
- [GH-2] added rehydrateIndexItem [`97847dd`](https://github.com/karmaniverous/entity-manager/commit/97847ddcbdde3e9f67943d707612ae10f801c060)
- [GH-2] stub rehydratePageKeyMap & refactor validations [`4d05f84`](https://github.com/karmaniverous/entity-manager/commit/4d05f84e4af491037702a1ca54a6af12da3797da)
- [GH-2] wip [`b756028`](https://github.com/karmaniverous/entity-manager/commit/b756028abadc71069ade080255dd044a3e12fe10)
- [GH-2] wip synced with template [`a474851`](https://github.com/karmaniverous/entity-manager/commit/a47485150fadddad7e0de74d675ceeb4eeb8401d)
- [GH-2] wip [`fa14646`](https://github.com/karmaniverous/entity-manager/commit/fa146469cedcd18ea38a4b9262ae4ef49407f645)
- [GH-2] added rehydratePageKeyMep [`59a74bc`](https://github.com/karmaniverous/entity-manager/commit/59a74bc54cab88b8a6cb9dde67205b1cdca0640d)
- [GH-2] added atomic generated property & decode support [`5caeb66`](https://github.com/karmaniverous/entity-manager/commit/5caeb664a1627e917e63dc6fe8e78f7d809f7c22)
- [GH-2] refactored types [`14a579f`](https://github.com/karmaniverous/entity-manager/commit/14a579f48af5baeb403bd20f8649cefe12a688e9)
- [GH-2] finished refactoring query [`92014ca`](https://github.com/karmaniverous/entity-manager/commit/92014ca7b4220bf39b6f2a6c6207ea969d200e3d)
- [GH-2] Refactored EntityItem to ItemMap [`d463214`](https://github.com/karmaniverous/entity-manager/commit/d4632147d0deac42c58f0854130764001346002d)
- [GH-2] abstracted types [`41ef308`](https://github.com/karmaniverous/entity-manager/commit/41ef3082c643c154d87f318e699a40e73e0a83fa)
- [GH-2] wip query [`24ca831`](https://github.com/karmaniverous/entity-manager/commit/24ca831c51eef129b62c502d4d54b8be164a2719)
- [GH-2] refactors [`620032b`](https://github.com/karmaniverous/entity-manager/commit/620032bce1fb8e7f1b5c2ff897e77431923487fb)
- [GH-2] wip addig dehydratePageKeys [`e076479`](https://github.com/karmaniverous/entity-manager/commit/e076479d6530172f34374ff3c4cda81d814a5637)
- [GH-2] added delimiter config support [`ee91a6b`](https://github.com/karmaniverous/entity-manager/commit/ee91a6ba96fa4ac244dc39d658b7a9e6b785ef5b)
- [GH-2] updated docs [`4bf2954`](https://github.com/karmaniverous/entity-manager/commit/4bf295455c2371a8d39d0a7e59d061f7389c83bf)
- [GH-2] created type-safe config [`dc2990b`](https://github.com/karmaniverous/entity-manager/commit/dc2990becbfa9f9d0fe83f11eb228c0ffada98d1)
- [GH-2] added indexable type map support [`63e5a16`](https://github.com/karmaniverous/entity-manager/commit/63e5a166a4ac3876004509bd8e3879e91cd47806)
- [GH-2] created Entity & EntityMap base types [`73f714b`](https://github.com/karmaniverous/entity-manager/commit/73f714bbbac737cbcfeb3ff08bbff238f397cc8b)
- [GH-2] unwrapped EntityItem type [`d6a9de2`](https://github.com/karmaniverous/entity-manager/commit/d6a9de275691925e016aa4b6f392d1d14c552947)
- [GH-2] added index dehydration [`3f015a0`](https://github.com/karmaniverous/entity-manager/commit/3f015a07a35da98d3bef61b2e9c9df070788928f)
- [GH-2] cleaned up never comparisons & introduced types key [`7b8fe3a`](https://github.com/karmaniverous/entity-manager/commit/7b8fe3a64fa85f37cac1a525d9ccaf66cbc63a6a)
- [GH-2] replaced injectable logger with console [`4b69ecd`](https://github.com/karmaniverous/entity-manager/commit/4b69ecd9731ffc27d6087b763a6663a55fc3e860)
- [GH-2] wip [`4a5e2ab`](https://github.com/karmaniverous/entity-manager/commit/4a5e2abaa2ff8d811c3a1b46dbe2be237f4ac8d5)
- [GH-2] refactor wip [`e075df7`](https://github.com/karmaniverous/entity-manager/commit/e075df70bca70558e1ab6144895012c56434406d)
- [GH-2] finished dehydratePageKeyMap [`cdae34b`](https://github.com/karmaniverous/entity-manager/commit/cdae34bb66c7b49b9cc190449827f9266f3a28be)
- [GH-2] updated docs [`d08f2d8`](https://github.com/karmaniverous/entity-manager/commit/d08f2d841b2b4f24edcec71798481500097c6f55)
- [GH-2] titivation [`d5b1f6b`](https://github.com/karmaniverous/entity-manager/commit/d5b1f6b4f9ea9d7c9afb46d38229b3b26dc42764)
- [GH-2] eliminated EM options layer [`018d7b0`](https://github.com/karmaniverous/entity-manager/commit/018d7b06b220c006878ca901fbbcad6e9fbf59bc)
- [GH-2] added types to ParsedConfig [`374b794`](https://github.com/karmaniverous/entity-manager/commit/374b794acee7219df01572e79e2685722ea0b03e)
- [GH-2] wip [`660bcef`](https://github.com/karmaniverous/entity-manager/commit/660bcefa33a1625e4ee15bf06439112be2fa8a06)
- [GH-2] ignore key type optionality [`dac19a0`](https://github.com/karmaniverous/entity-manager/commit/dac19a09ac0a8e24eabb2ac4541b4d41c6edc1b7)
- [GH-2] Updated TODOs [`251d086`](https://github.com/karmaniverous/entity-manager/commit/251d0868f05ff6867b3789d4b2b9d551015174ba)
- lintfix [`c5ca2de`](https://github.com/karmaniverous/entity-manager/commit/c5ca2deccde624b91405f4656d33517b732f74ae)
- [GH-2] make never fields optional [`aa0ea4a`](https://github.com/karmaniverous/entity-manager/commit/aa0ea4a9bcd137b5c190fefa3b48a1a07d18c45c)
- [GH-2] updated release script [`fe04b50`](https://github.com/karmaniverous/entity-manager/commit/fe04b501bb95526ed7f9e978d00cd8564890042e)
- [GH-2] removed test code [`ae81cf6`](https://github.com/karmaniverous/entity-manager/commit/ae81cf6becaf44ff1854c38974e38b954a5b450c)

#### [v5.0.9](https://github.com/karmaniverous/entity-manager/compare/v5.0.8...v5.0.9)

> 21 August 2024

- updated readme [`78bb63f`](https://github.com/karmaniverous/entity-manager/commit/78bb63f1114bbc56c627bf296593264444f9b8f5)
- updated docs [`fae8767`](https://github.com/karmaniverous/entity-manager/commit/fae876708967bdcb6b0b968803db9d9a8848718d)
- updated dependencies [`72fb9fd`](https://github.com/karmaniverous/entity-manager/commit/72fb9fdb3bf234a6a67808bf67c0b0ec80c50f72)
- Release 5.0.9 [`61c3eb2`](https://github.com/karmaniverous/entity-manager/commit/61c3eb2ae0b087acc0737e09e37cd03271095281)
- Create FUNDING.yml [`06eeb43`](https://github.com/karmaniverous/entity-manager/commit/06eeb43f244ab8a9b03f1713f193d21845baa0fc)

#### [v5.0.8](https://github.com/karmaniverous/entity-manager/compare/v5.0.7...v5.0.8)

> 30 July 2024

- updated dependencies [`4e5c8a8`](https://github.com/karmaniverous/entity-manager/commit/4e5c8a80f8005f1df877e979209d21805903f9ed)
- improved logging [`0ffe26b`](https://github.com/karmaniverous/entity-manager/commit/0ffe26bfe58847ca869b7c8ae007f3f9182035af)
- Release 5.0.8 [`7fe5e08`](https://github.com/karmaniverous/entity-manager/commit/7fe5e086e5a8b3b100dfa3de0a4f19ae1a053f9b)

#### [v5.0.7](https://github.com/karmaniverous/entity-manager/compare/v5.0.6...v5.0.7)

> 17 July 2024

- updated dependencies [`4e2b888`](https://github.com/karmaniverous/entity-manager/commit/4e2b88827c8141ee8a5f4d8834c24f072462c567)
- Release 5.0.7 [`ec6f1af`](https://github.com/karmaniverous/entity-manager/commit/ec6f1af43a6e872e5ad043ce2e0e7c5b00d06dcb)

#### [v5.0.6](https://github.com/karmaniverous/entity-manager/compare/v5.0.5...v5.0.6)

> 3 July 2024

- updated dependencies [`8df82ec`](https://github.com/karmaniverous/entity-manager/commit/8df82ec7fa377f873a2431cd0349cf0e0de34327)
- Release 5.0.6 [`e096b46`](https://github.com/karmaniverous/entity-manager/commit/e096b46c0889b2b6177795babf462828e7d01a47)

#### [v5.0.5](https://github.com/karmaniverous/entity-manager/compare/v5.0.4...v5.0.5)

> 19 June 2024

- added knip [`253a91b`](https://github.com/karmaniverous/entity-manager/commit/253a91beeb9ffb2e495100a45be17ba6d348028f)
- updated dependencies [`9db2e62`](https://github.com/karmaniverous/entity-manager/commit/9db2e622857f9de217f2132a1fb04abb59534dd9)
- updated dependencies [`4a98acb`](https://github.com/karmaniverous/entity-manager/commit/4a98acbd83e42db5dd0d5bfaa6d18dce35d56927)
- Release 5.0.5 [`835122d`](https://github.com/karmaniverous/entity-manager/commit/835122dc199a71eedaa3dfc297e271a3c018b4ac)

#### [v5.0.4](https://github.com/karmaniverous/entity-manager/compare/v5.0.3...v5.0.4)

> 6 June 2024

- updated dependencies [`11671dc`](https://github.com/karmaniverous/entity-manager/commit/11671dc4528f6192e1fae762222307bcc1f35692)
- Release 5.0.4 [`5c9240b`](https://github.com/karmaniverous/entity-manager/commit/5c9240b7ec406713c201f2ad49d69ed88ba05f1c)

#### [v5.0.3](https://github.com/karmaniverous/entity-manager/compare/v5.0.2...v5.0.3)

> 22 May 2024

- updated dependencies [`ba0ecfc`](https://github.com/karmaniverous/entity-manager/commit/ba0ecfcfab44568801391fee875e13c786e39ea7)
- Release 5.0.3 [`7360628`](https://github.com/karmaniverous/entity-manager/commit/7360628dfd0653bb64db408885293941981f0ba4)

#### [v5.0.2](https://github.com/karmaniverous/entity-manager/compare/v5.0.1...v5.0.2)

> 27 March 2024

- updated dependencies [`5865d23`](https://github.com/karmaniverous/entity-manager/commit/5865d23efeff4d4dd08324fa6989e50e707d1e8a)
- Release 5.0.2 [`11ba543`](https://github.com/karmaniverous/entity-manager/commit/11ba543d1fb95baae5b6e78b17842058b348e9a9)

#### [v5.0.1](https://github.com/karmaniverous/entity-manager/compare/v5.0.0...v5.0.1)

> 23 March 2024

- permit limit === Infinity [`d49dd3c`](https://github.com/karmaniverous/entity-manager/commit/d49dd3cf8c68a746636ee205a32b5d38a48b4fad)
- Release 5.0.1 [`c223223`](https://github.com/karmaniverous/entity-manager/commit/c223223880702a27bd264680c3c260935f23dbd9)

### [v5.0.0](https://github.com/karmaniverous/entity-manager/compare/v4.4.3...v5.0.0)

> 22 March 2024

- removed pages & introduced pageSize [`4a81975`](https://github.com/karmaniverous/entity-manager/commit/4a819759d921dd4e0547e5e8ba40ca3eb099084c)
- documentation [`df5bbf3`](https://github.com/karmaniverous/entity-manager/commit/df5bbf3bbe3f7966c0ce6be1cb088c2fa16ed718)
- Release 5.0.0 [`7b68e9c`](https://github.com/karmaniverous/entity-manager/commit/7b68e9c778a411a327a3916bd9787e272b1be377)

#### [v4.4.3](https://github.com/karmaniverous/entity-manager/compare/v4.4.2...v4.4.3)

> 15 March 2024

- Release 4.4.3 [`20f93c2`](https://github.com/karmaniverous/entity-manager/commit/20f93c2532d325a17b3453c204a9ea6951d2a1a6)
- set default pages to 1 & expand request limit to limit * pages [`8eea3e9`](https://github.com/karmaniverous/entity-manager/commit/8eea3e944b994981084f5d4112e5d6ec4feacf9f)

#### [v4.4.2](https://github.com/karmaniverous/entity-manager/compare/v4.4.1...v4.4.2)

> 27 February 2024

- updated dependencies [`bfbf342`](https://github.com/karmaniverous/entity-manager/commit/bfbf342de94a2b80b290c267b4a489bf748ef4d2)
- Release 4.4.2 [`fa4996f`](https://github.com/karmaniverous/entity-manager/commit/fa4996f33195cb183e56cbc506bb56b1e43442a4)

#### [v4.4.1](https://github.com/karmaniverous/entity-manager/compare/v4.4.0...v4.4.1)

> 6 February 2024

- Updated page logic to fill limit on query [`4840f49`](https://github.com/karmaniverous/entity-manager/commit/4840f49d494073e960a186c35207e6f82941ce5b)
- Release 4.4.1 [`8184a97`](https://github.com/karmaniverous/entity-manager/commit/8184a97d467d519692116fbc29357aa3e2b52712)

#### [v4.4.0](https://github.com/karmaniverous/entity-manager/compare/v4.3.3...v4.4.0)

> 5 January 2024

- updated dependencies [`4ca6354`](https://github.com/karmaniverous/entity-manager/commit/4ca63547cd0aaeb4f4ad5a3f3a5226a281eb71d4)
- updated readme [`2403b22`](https://github.com/karmaniverous/entity-manager/commit/2403b220b8f4877ed71278b88af022b1e7be747d)
- Add defaultLimit to entity config [`7a8e791`](https://github.com/karmaniverous/entity-manager/commit/7a8e79167cfa0d55f30751067a83e9d084445a3e)
- Release 4.4.0 [`c00abdc`](https://github.com/karmaniverous/entity-manager/commit/c00abdc761717c2bc487a75e1e40c7e6cd17e05b)

#### [v4.3.3](https://github.com/karmaniverous/entity-manager/compare/v4.3.2...v4.3.3)

> 24 November 2023

- updated dependencies [`4f61124`](https://github.com/karmaniverous/entity-manager/commit/4f61124f64ada52ced73dbf89aa72319bd1cefae)
- Release 4.3.3 [`68e660b`](https://github.com/karmaniverous/entity-manager/commit/68e660bb56863fe02c6a341e19f1c659f1e05aeb)

#### [v4.3.2](https://github.com/karmaniverous/entity-manager/compare/v4.3.1...v4.3.2)

> 14 October 2023

- updated dependencies [`2130fe2`](https://github.com/karmaniverous/entity-manager/commit/2130fe277f600c335b9abfcc0c966f6fd1906556)
- Release 4.3.2 [`a8453ea`](https://github.com/karmaniverous/entity-manager/commit/a8453ea885bd8b8224ca422f53ab2cbb8565acd9)

#### [v4.3.1](https://github.com/karmaniverous/entity-manager/compare/v4.3.0...v4.3.1)

> 15 August 2023

- updated dependencies [`8b283f0`](https://github.com/karmaniverous/entity-manager/commit/8b283f036f3210e026faff1f1dd3013763bee2ea)
- Release 4.3.1 [`1779ce2`](https://github.com/karmaniverous/entity-manager/commit/1779ce2f2a687ba9c509d9918e69f90140419e51)

#### [v4.3.0](https://github.com/karmaniverous/entity-manager/compare/v4.3.0-2...v4.3.0)

> 12 July 2023

- added logging [`283ea09`](https://github.com/karmaniverous/entity-manager/commit/283ea09cb2da8cd14b110aa23167ef65e689d36d)
- Release 4.3.0 [`812a14e`](https://github.com/karmaniverous/entity-manager/commit/812a14e3a84d505171ee9baf0306973997d3a948)

#### [v4.3.0-2](https://github.com/karmaniverous/entity-manager/compare/v4.3.0-1...v4.3.0-2)

> 11 July 2023

- Release 4.3.0-2 [`816535f`](https://github.com/karmaniverous/entity-manager/commit/816535fdf319630faf87e2b61e9668a467f0d2fe)
- bugfix [`95a80a5`](https://github.com/karmaniverous/entity-manager/commit/95a80a585ac480be72c7b41a060138c03daf9def)

#### [v4.3.0-1](https://github.com/karmaniverous/entity-manager/compare/v4.3.0-0...v4.3.0-1)

> 11 July 2023

- bugfix [`22237a6`](https://github.com/karmaniverous/entity-manager/commit/22237a65756a7f916701ee77c651692b42d70459)
- Release 4.3.0-1 [`f2fb3ae`](https://github.com/karmaniverous/entity-manager/commit/f2fb3aeeed7a2ca56a281161ccf878551002856f)

#### [v4.3.0-0](https://github.com/karmaniverous/entity-manager/compare/v4.2.1...v4.3.0-0)

> 11 July 2023

- package updates [`dd414d6`](https://github.com/karmaniverous/entity-manager/commit/dd414d6d400e67833ed7a030a590f295ef4060da)
- added multi-page search [`0823186`](https://github.com/karmaniverous/entity-manager/commit/082318668203555780be6cf7612f3854a4c4a6a1)
- Release 4.3.0-0 [`0698d02`](https://github.com/karmaniverous/entity-manager/commit/0698d0259f634bab05254e258832b9e9fdafc99b)
- updated docs [`5072cad`](https://github.com/karmaniverous/entity-manager/commit/5072cadb3b659d2e0139c8b49b6e37d2e7bf9977)

#### [v4.2.1](https://github.com/karmaniverous/entity-manager/compare/v4.2.0...v4.2.1)

> 13 May 2023

- Release 4.2.1 [`4ab5285`](https://github.com/karmaniverous/entity-manager/commit/4ab5285e45563c96b5e3b4bde3cef51d892f9d4b)
- variable name type [`0234130`](https://github.com/karmaniverous/entity-manager/commit/0234130bfc7f618cf4ec630e9e2f9d9c477fcce3)

#### [v4.2.0](https://github.com/karmaniverous/entity-manager/compare/v4.1.0...v4.2.0)

> 13 May 2023

- added key retain support [`3758f5f`](https://github.com/karmaniverous/entity-manager/commit/3758f5f3bc62177735c981ac3e1351997b1de60c)
- Release 4.2.0 [`9a0b782`](https://github.com/karmaniverous/entity-manager/commit/9a0b7829e92de2fd5faafdccf479d5d63711181d)

#### [v4.1.0](https://github.com/karmaniverous/entity-manager/compare/v4.0.0...v4.1.0)

> 10 May 2023

- added count to query return [`7a5b0eb`](https://github.com/karmaniverous/entity-manager/commit/7a5b0eb27837cec24fa479cf66bbca3883bf3f8c)
- Release 4.1.0 [`f5f1506`](https://github.com/karmaniverous/entity-manager/commit/f5f1506f8a83ec427723bfe2d500ba0ff670afce)

### [v4.0.0](https://github.com/karmaniverous/entity-manager/compare/v3.0.0...v4.0.0)

> 10 May 2023

- refactored query function [`207f431`](https://github.com/karmaniverous/entity-manager/commit/207f43136c2ac7b5fa760328388e345a3f56575e)
- Release 4.0.0 [`436f237`](https://github.com/karmaniverous/entity-manager/commit/436f2379bd01797a30ffefdae5a4992dcef146c0)

### [v3.0.0](https://github.com/karmaniverous/entity-manager/compare/v2.2.1...v3.0.0)

> 29 March 2023

- Exposed getKey method. [`c2b87a6`](https://github.com/karmaniverous/entity-manager/commit/c2b87a6353f6dd04e23cdfcc38c56dc412fc3d27)
- Add groups to decode config [`e54cfed`](https://github.com/karmaniverous/entity-manager/commit/e54cfed93139fbf54d28a90135551bbf86f72981)
- Release 3.0.0 [`7f48a43`](https://github.com/karmaniverous/entity-manager/commit/7f48a4342d9d035a13fc30d2c2e2c763849a0092)

#### [v2.2.1](https://github.com/karmaniverous/entity-manager/compare/v2.2.0...v2.2.1)

> 28 March 2023

- updated indexToken argument [`7776f53`](https://github.com/karmaniverous/entity-manager/commit/7776f537ee70999efc4f26baef900a023ef0663c)
- Release 2.2.1 [`a9564e3`](https://github.com/karmaniverous/entity-manager/commit/a9564e3ff0f7cf1c615596fa82370ab63460f515)

#### [v2.2.0](https://github.com/karmaniverous/entity-manager/compare/v2.1.3...v2.2.0)

> 28 March 2023

- expanded rehydrateIndex arguments [`d8767e5`](https://github.com/karmaniverous/entity-manager/commit/d8767e51f02838d2d98c3a0f3b8d31599f39b3ec)
- Release 2.2.0 [`39e6bc0`](https://github.com/karmaniverous/entity-manager/commit/39e6bc09e11ed2be29739b1b0300bf03e127bc87)

#### [v2.1.3](https://github.com/karmaniverous/entity-manager/compare/v2.1.2...v2.1.3)

> 27 March 2023

- simplified decode functions [`3a712ba`](https://github.com/karmaniverous/entity-manager/commit/3a712ba1525d2a856c7573d5025184d53e3f30e9)
- Release 2.1.3 [`31520bb`](https://github.com/karmaniverous/entity-manager/commit/31520bbd496f6ce0eed16a28cc99c62071fed337)

#### [v2.1.2](https://github.com/karmaniverous/entity-manager/compare/v2.1.0...v2.1.2)

> 27 March 2023

- improved index dehydrate/rehydrate [`82a307c`](https://github.com/karmaniverous/entity-manager/commit/82a307cc1f1f0efde7bf0485b14c9d44087278c5)
- simplified decode functions [`944cbef`](https://github.com/karmaniverous/entity-manager/commit/944cbefb69cc1fd1f3629e8123b69b5899f5b75d)
- Release 2.1.2 [`cf6cb58`](https://github.com/karmaniverous/entity-manager/commit/cf6cb5848db87e0cfd8ed64273d6d577a6b0a8d1)
- Release 2.1.1 [`4e2b1fc`](https://github.com/karmaniverous/entity-manager/commit/4e2b1fcce409f21b4f9266b99b5b2ac2679297c0)
- updated test to reflect *! entityPK [`eb7fc93`](https://github.com/karmaniverous/entity-manager/commit/eb7fc93f1f3e520354f9e1f9ae75afa28c1c4bdb)

#### [v2.1.0](https://github.com/karmaniverous/entity-manager/compare/v2.0.6...v2.1.0)

> 27 March 2023

- Initial commit [`ab7a546`](https://github.com/karmaniverous/entity-manager/commit/ab7a546c405e44552f4ee9b0e348cc8684b6ce7c)
- refactored to EntityManager with private class [`e4cadc9`](https://github.com/karmaniverous/entity-manager/commit/e4cadc9237c1550708d56565ffbbf53a259a74e1)
- refactored to shard-key-manager [`89ae74b`](https://github.com/karmaniverous/entity-manager/commit/89ae74b0955db6731576faf22ecb0e1f6ed46559)
- added dehydrate/rehydrate index [`c98b0b8`](https://github.com/karmaniverous/entity-manager/commit/c98b0b84b33a809f7c8d17f5c43dab266508cf8d)
- switched to faster hash algo [`369d6bc`](https://github.com/karmaniverous/entity-manager/commit/369d6bc22512cf58916551569cd2c8312077a038)
- added EntityManager methods [`d9aefbf`](https://github.com/karmaniverous/entity-manager/commit/d9aefbf358ea5d2d90ecb4ddc9f769e68c9beb94)
- readability [`1ebed3d`](https://github.com/karmaniverous/entity-manager/commit/1ebed3de130d85b7dc7dbf5d5af1966eea281d1e)
- updated npmenclature [`f5563fb`](https://github.com/karmaniverous/entity-manager/commit/f5563fb1d3ca1db715533f61c2c44281e59d7340)
- basic config [`4244f4b`](https://github.com/karmaniverous/entity-manager/commit/4244f4b7f0baf12fb7e39f00103549899ed9e775)
- added query method [`f71ad6b`](https://github.com/karmaniverous/entity-manager/commit/f71ad6b436072128d0e70b743e851730c50e568f)
- updated docs [`a919b4c`](https://github.com/karmaniverous/entity-manager/commit/a919b4c12c515f8d49ddaba6b012df9b80e84214)
- added jsonschema tests [`94f9c11`](https://github.com/karmaniverous/entity-manager/commit/94f9c11ca8b22439f80fc6ee0c3c7e1b020b5478)
- update docs [`872e5c6`](https://github.com/karmaniverous/entity-manager/commit/872e5c65bf7bb4038d91961c1aaf15debb8c15e9)
- tested bumped keyspaces [`23172fb`](https://github.com/karmaniverous/entity-manager/commit/23172fb5c41b665ecfd1d05092ad32e5909aed5e)
- added options params to query function [`1c4ec36`](https://github.com/karmaniverous/entity-manager/commit/1c4ec36a9975f6baedbc34a4138f17628d2dabd1)
- Added removeKeys method [`8166f1e`](https://github.com/karmaniverous/entity-manager/commit/8166f1e11541b846f4fa79dcf030d4726e9be60f)
- switched sn2u to sn2n [`7c2610c`](https://github.com/karmaniverous/entity-manager/commit/7c2610cd0895f7ae1636fb9a5e1af7c6a0497c0e)
- updated docs [`f0c464e`](https://github.com/karmaniverous/entity-manager/commit/f0c464e8837ab3ca8ac792cbc875f555f714850a)
- reversed keyToken & item arguments [`ec333f5`](https://github.com/karmaniverous/entity-manager/commit/ec333f555fcd035e6ddc6fdb681d313ce27c4856)
- improved logging [`128aae9`](https://github.com/karmaniverous/entity-manager/commit/128aae96b3f62bdc196065b69c0a37b1c91dd84a)
- converted addKeys to non-mutating logic [`03cc225`](https://github.com/karmaniverous/entity-manager/commit/03cc225db1221e26843a5dbc32b614841e8dfce9)
- refactor shardPageKeys to pageKeys [`408bb66`](https://github.com/karmaniverous/entity-manager/commit/408bb66d8e1cbc65cd7587e84142c2dc1f633903)
- eliminated lodash chaining [`4c53e5d`](https://github.com/karmaniverous/entity-manager/commit/4c53e5dbcf1f5fb5b4cd08cc70fa7f386a168f7c)
- doc update [`b1737a2`](https://github.com/karmaniverous/entity-manager/commit/b1737a2005a85ab1d627243f631c7715716ea829)
- renamed to shard-manager [`977e461`](https://github.com/karmaniverous/entity-manager/commit/977e4619862d006743de836e2bb65541530a755d)
- org change [`e2d582f`](https://github.com/karmaniverous/entity-manager/commit/e2d582ff1bf00135d56c914d3154f8c3ab10eec0)
- updated docs [`860d62b`](https://github.com/karmaniverous/entity-manager/commit/860d62b369157bbc207abdc7cd41dde389b03bc8)
- doc update [`f6a3165`](https://github.com/karmaniverous/entity-manager/commit/f6a316534dac674febb98891121a992ce76f171c)
- doc update [`cd5ee9c`](https://github.com/karmaniverous/entity-manager/commit/cd5ee9c90b1db7635dbcd4318fd0be89016cd035)
- doc update [`38b11dc`](https://github.com/karmaniverous/entity-manager/commit/38b11dc2ebde62addf1ee85e8db3ada18e4fd40d)
- logging [`f0dd069`](https://github.com/karmaniverous/entity-manager/commit/f0dd069560e47b0ce30b7763592179b86271b895)
- Eliminated prod dependency [`1a77c45`](https://github.com/karmaniverous/entity-manager/commit/1a77c459e948182fb428f4c4242bb6108d0b0673)
- Release 2.1.0 [`e93382d`](https://github.com/karmaniverous/entity-manager/commit/e93382d45ca96aee3b6cc1b2728a689460f3c898)
- Release 2.0.0 [`d7ce929`](https://github.com/karmaniverous/entity-manager/commit/d7ce9293f39df0d6af1a5363535183aec132475e)
- Release 1.0.0 [`e5cffd4`](https://github.com/karmaniverous/entity-manager/commit/e5cffd4e04239d1490757a25e423bf519a09bf7b)
- Release 0.1.2-1 [`54a9bff`](https://github.com/karmaniverous/entity-manager/commit/54a9bff5d4f131cf5cfaaa4cddbb04ddfd8be4bb)
- Release 0.1.2-0 [`bfc84ef`](https://github.com/karmaniverous/entity-manager/commit/bfc84ef33e14d5ce1529b33e0d9c2db08bfe45c6)
- Release 0.1.1 [`f0aea12`](https://github.com/karmaniverous/entity-manager/commit/f0aea12911e4594f24dda65f741c14f5873637d0)
- Release 0.1.0 [`a6c327c`](https://github.com/karmaniverous/entity-manager/commit/a6c327cedbf21e680772c11f1b46dae6e32f2309)
- Release 0.0.12 [`e2490cd`](https://github.com/karmaniverous/entity-manager/commit/e2490cdde9772a1ebea4a7fb2498d189f7d7da52)
- Release 0.0.11 [`e2b7d80`](https://github.com/karmaniverous/entity-manager/commit/e2b7d802074b6290632f1c2ce1594f22122ae648)
- Release 0.0.10 [`0143a6a`](https://github.com/karmaniverous/entity-manager/commit/0143a6a3fe3fe1aca259c72f3208abf20ffa1710)
- Release 0.0.9 [`ee3e985`](https://github.com/karmaniverous/entity-manager/commit/ee3e985967cf3861a83a7e2dab9461953bc445e3)
- updated test config obj [`5b654ce`](https://github.com/karmaniverous/entity-manager/commit/5b654ce3bd7bde3c7f34bd0ce6f66612371c10ce)
- Release 0.0.8 [`bd88dda`](https://github.com/karmaniverous/entity-manager/commit/bd88dda2436c257f2cc8d77014660bcd892d29cb)
- Release 0.0.7 [`6932a79`](https://github.com/karmaniverous/entity-manager/commit/6932a79d0ebee6d34b7044e73df0c0c745b7beae)
- Release 0.0.6 [`0d1b776`](https://github.com/karmaniverous/entity-manager/commit/0d1b776b3dd110b58d1ff46699041a8b91d76db7)
- doc update [`653beb9`](https://github.com/karmaniverous/entity-manager/commit/653beb92905d08e0ebbcb018302a897ea3b6accb)
- Release 0.0.5 [`2584f3c`](https://github.com/karmaniverous/entity-manager/commit/2584f3c33f16f21aa44dc83d23614c0100164aec)
- Release 0.0.4 [`89eebda`](https://github.com/karmaniverous/entity-manager/commit/89eebda8cf37cec2741b01d57ca7ba0b55e6104b)
- Release 0.0.3 [`78b8a8d`](https://github.com/karmaniverous/entity-manager/commit/78b8a8d8d50e68dbc828199c3fb96502bfbae7b0)
- doc update [`3c654ce`](https://github.com/karmaniverous/entity-manager/commit/3c654ce62a0d7adf4850e0b84d77f57df3a2fcbf)
- Release 0.0.2 [`978d64e`](https://github.com/karmaniverous/entity-manager/commit/978d64e855bf4441e88a8eacab659af6b914cdda)
- Release 0.0.1 [`8d4fdbd`](https://github.com/karmaniverous/entity-manager/commit/8d4fdbd5cf046123f3c49772b49c94cd260d6a68)
- delete nil shard keys [`28650fe`](https://github.com/karmaniverous/entity-manager/commit/28650fef1078b4fa1830f4988537f7cc54f4d8dd)
- docs update [`2ad2ad6`](https://github.com/karmaniverous/entity-manager/commit/2ad2ad64668387e972bbba6fce030af56fb1ea91)
- doc update [`335adb1`](https://github.com/karmaniverous/entity-manager/commit/335adb118b7e6a6adcc98d10f573b59239952007)
- updated docs [`e7dbe40`](https://github.com/karmaniverous/entity-manager/commit/e7dbe40076a8aa7a34b89f8f164c899ade625889)
- doc update [`80afcac`](https://github.com/karmaniverous/entity-manager/commit/80afcaca0284155f062cf4d657ae254134794e06)
- fixed test error [`ec5c5d2`](https://github.com/karmaniverous/entity-manager/commit/ec5c5d225b05ec9315e8969db26c8cc43e533d81)
- removed bin entry point [`e5fff10`](https://github.com/karmaniverous/entity-manager/commit/e5fff10be1290290afaf482ca96a7cb5c25176d6)
- fixed getShardKeySpace [`fbaebd6`](https://github.com/karmaniverous/entity-manager/commit/fbaebd606dc346c9cf599dd5e6500081d265393d)

#### [v2.0.6](https://github.com/karmaniverous/entity-manager/compare/v2.0.0...v2.0.6)

> 9 June 2024

- Feature/GH-16-support-prerelease-from-any-branch [`#17`](https://github.com/karmaniverous/entity-manager/pull/17)
- [GH-14] added tsdoc support [`#15`](https://github.com/karmaniverous/entity-manager/pull/15)
- [GH-12] added json import support [`#13`](https://github.com/karmaniverous/entity-manager/pull/13)
- Feature/gh-6-add-cli-support [`#9`](https://github.com/karmaniverous/entity-manager/pull/9)
- [GH-4] Added tslog logging [`#5`](https://github.com/karmaniverous/entity-manager/pull/5)
- [GH-1] updated release scripts [`#3`](https://github.com/karmaniverous/entity-manager/pull/3)
- [GH-1] installed & configured release-it [`#2`](https://github.com/karmaniverous/entity-manager/pull/2)
- wip [`1b1d022`](https://github.com/karmaniverous/entity-manager/commit/1b1d022e29f058aa8a5378831e489a426bcc66a9)
- initial commit [`d8b4846`](https://github.com/karmaniverous/entity-manager/commit/d8b484653f8f018ff9835c4a3b88835d95332b3e)
- updated dependencies [`ca882a3`](https://github.com/karmaniverous/entity-manager/commit/ca882a3d59eb145a6a58e366ce3e91eff49a3416)
- installed & configured rollup [`b9ac884`](https://github.com/karmaniverous/entity-manager/commit/b9ac8849a3858bcc8e1f676deab48791cbde8452)
- Added noderesolve & incremental builds [`de7ce79`](https://github.com/karmaniverous/entity-manager/commit/de7ce7922f698a90b6db222fede70c4be5586ac3)
- updated dependencies [`ceb4894`](https://github.com/karmaniverous/entity-manager/commit/ceb489482c55cee21edeea6e5701db29dd311635)
- installed prettier & configured eslint [`0bb0e54`](https://github.com/karmaniverous/entity-manager/commit/0bb0e540e8c718863f95e55cf119e032d2ba1aaf)
- [GH-6] added CLI support [`b2bfd0c`](https://github.com/karmaniverous/entity-manager/commit/b2bfd0ca39e1fdcd8865fcaf039a450da986533f)
- updated docs & recommended extensions [`da662d4`](https://github.com/karmaniverous/entity-manager/commit/da662d4bd4bd989a2d82b19aa5995951d268b8d1)
- got tests working [`f20a6d9`](https://github.com/karmaniverous/entity-manager/commit/f20a6d9994e7272c41598aedfeb282172f38d860)
- [GH-6] wip [`27aa2ee`](https://github.com/karmaniverous/entity-manager/commit/27aa2ee57f706c0360a64e9d6419b319db0e9598)
- [GH-7] resolved iife build warnings [`7b3e30a`](https://github.com/karmaniverous/entity-manager/commit/7b3e30aed09b7f921c3245377e67a04b155eb28b)
- [GH-16] added release:pre script [`275825d`](https://github.com/karmaniverous/entity-manager/commit/275825d747f25af09cb20fda13959032790689c6)
- got code coverage working [`e2ca955`](https://github.com/karmaniverous/entity-manager/commit/e2ca95524ff0d43e06a724b92b90ebf67e7cb35b)
- updated package meta [`b514607`](https://github.com/karmaniverous/entity-manager/commit/b51460736b0dbdd192cf01e11f271311d80f659c)
- sorted json [`20dc1d1`](https://github.com/karmaniverous/entity-manager/commit/20dc1d1c1e2092c677cebfb1e66157b9498f9a12)
- updated build script & exports [`9f90d08`](https://github.com/karmaniverous/entity-manager/commit/9f90d08f2ce74c241aa05dc04d92a65b92963091)
- updated package.json [`f4ae65b`](https://github.com/karmaniverous/entity-manager/commit/f4ae65bf46deaa271970f145a238a843d8f9a8da)
- updated docs [`ca8c1e5`](https://github.com/karmaniverous/entity-manager/commit/ca8c1e5182a1f1ec5010c99f399d469bdfc0f14d)
- [GH-6] updated readme [`79457cd`](https://github.com/karmaniverous/entity-manager/commit/79457cd2e0b8c67d55353a44f64b76c2bedbebc3)
- reordered exports [`42b7007`](https://github.com/karmaniverous/entity-manager/commit/42b70077df4899d98d5e536d3e27017c43a11df1)
- bounded editor word wrap for markdown [`327637a`](https://github.com/karmaniverous/entity-manager/commit/327637a0a412475840fe1f4db16164eb277d01ef)
- cjs -&gt; cts [`eafc162`](https://github.com/karmaniverous/entity-manager/commit/eafc162462b14da0015e8c7ad32aa9fd01cb5930)
- fleshed out exports [`0cf492e`](https://github.com/karmaniverous/entity-manager/commit/0cf492e95c4bf4483334d73f3c034c281bed1efd)
- [GH-6] updated README.md [`87a0062`](https://github.com/karmaniverous/entity-manager/commit/87a00623bfce8a5f3786113404b858fed6e84469)
- chore: release v2.0.6 [`7e921ec`](https://github.com/karmaniverous/entity-manager/commit/7e921ec52d99474813a397bdb14d1429d7ee6f76)
- chore: release v0.4.1 [`383286d`](https://github.com/karmaniverous/entity-manager/commit/383286d0c56d6fe08f709fce20e8b65e47eef766)
- chore: release v0.4.0 [`c6b73ed`](https://github.com/karmaniverous/entity-manager/commit/c6b73ed5ceb0745e972dac7d4de7bd52c19e6d26)
- chore: release v0.3.0 [`6b0b6f3`](https://github.com/karmaniverous/entity-manager/commit/6b0b6f3098310beb76c1fd683f5868a3d6689b2a)
- chore: release v0.2.1 [`b154990`](https://github.com/karmaniverous/entity-manager/commit/b1549907847ba369d808b6f9e3baf92c436acb24)
- chore: release v0.2.0 [`67f50b4`](https://github.com/karmaniverous/entity-manager/commit/67f50b4e285857e5e52d317694dc6975b053d382)
- chore: release v0.1.0 [`47df9d0`](https://github.com/karmaniverous/entity-manager/commit/47df9d0e5d35337e240ac6aa720b920bb558fab2)
- chore: release v0.0.10 [`b0c409c`](https://github.com/karmaniverous/entity-manager/commit/b0c409c6da61b6732bd2ab45abfd9c72b510f2cb)
- chore: release v0.0.9 [`5ab12ed`](https://github.com/karmaniverous/entity-manager/commit/5ab12edbacc9093821191ad1d85532e5630b4b7a)
- chore: release v0.0.8 [`8812313`](https://github.com/karmaniverous/entity-manager/commit/8812313e119298f266b446b7b6b23b1eac5a58bb)
- chore: release v0.0.7 [`a260c8f`](https://github.com/karmaniverous/entity-manager/commit/a260c8f31687519b6f111612be15fe14e7be38ba)
- chore: release v0.0.6 [`4b6cec8`](https://github.com/karmaniverous/entity-manager/commit/4b6cec865c4334b499c41af1c90158061310ce1c)
- chore: release v0.0.5 [`a3c80f9`](https://github.com/karmaniverous/entity-manager/commit/a3c80f98be715ed81eb806a99e01395bad89ab45)
- chore: release v0.0.4 [`f849935`](https://github.com/karmaniverous/entity-manager/commit/f8499354723d30d617a94f16d00b7d0723955e28)
- chore: release v0.0.3 [`c9214d1`](https://github.com/karmaniverous/entity-manager/commit/c9214d14e00ed76dff88c2832104dcd596c4ed09)
- exclude tests [`ee7ce3a`](https://github.com/karmaniverous/entity-manager/commit/ee7ce3a27abd644fe810053d602dd8fccb948dd6)
- chore: release v0.0.2 [`6b656c8`](https://github.com/karmaniverous/entity-manager/commit/6b656c80ffe91eeac35618ee9a9469e482eb5826)
- chore: release v0.0.1 [`5fa932b`](https://github.com/karmaniverous/entity-manager/commit/5fa932b3e6e5414b49a1121c6a1abc97bac8961b)
- updated readme [`9327b68`](https://github.com/karmaniverous/entity-manager/commit/9327b68558ec844383f6e7456e8b4a5c89ff57eb)
- restored module & switched import to .js (!) [`69ed985`](https://github.com/karmaniverous/entity-manager/commit/69ed985d5fec3d75ccfc0a50076f4397b663f95b)
- updated readme [`7932290`](https://github.com/karmaniverous/entity-manager/commit/79322906a82e72d7ee348924b97f246634b143d9)
- updated readme [`cb38a92`](https://github.com/karmaniverous/entity-manager/commit/cb38a92ed1ef3c6466d654e1b16ec8f71f8bf2b7)
- docs [`519651a`](https://github.com/karmaniverous/entity-manager/commit/519651af2e8b9970bba7713d29126853f1e5203f)
- added testing to release script [`8e4517c`](https://github.com/karmaniverous/entity-manager/commit/8e4517c93e8880c6d8729e018ffc39fe3ba747c6)
- [GH-16] updated readme [`3ce1379`](https://github.com/karmaniverous/entity-manager/commit/3ce1379b66157813843bd9ea852daa5812d0df03)
- updated readme [`dff012e`](https://github.com/karmaniverous/entity-manager/commit/dff012e6d38677a5075fe713bcc4abc10f99fcf7)
- [GH-6] Merge branch 'main' into feature/gh-6-add-cli-support [`c0c7596`](https://github.com/karmaniverous/entity-manager/commit/c0c7596cdcd2fbb318e64ed436a9d309d22d90b9)
- Merge pull request #8 from karmaniverous/bugfix/GH-7-iife-build-warnings [`0014028`](https://github.com/karmaniverous/entity-manager/commit/0014028b420c262a53346a29e83eec665b0a3f69)
- added version number [`b3f026a`](https://github.com/karmaniverous/entity-manager/commit/b3f026ad272e91f9f5e9f6601ede81e67f3f226a)
- disabled lint errors [`2f814f5`](https://github.com/karmaniverous/entity-manager/commit/2f814f5e3a42e36a8b8770f7ceac38f8b6b3336a)
- removed .js from import [`fb96831`](https://github.com/karmaniverous/entity-manager/commit/fb96831f094b54a47cf97c5b03d3a02b0a689337)
- ignore nyc temp dir [`dd72b06`](https://github.com/karmaniverous/entity-manager/commit/dd72b06d6174be01d995d34a74c5bbeb14bb6388)
- updated version [`e305a76`](https://github.com/karmaniverous/entity-manager/commit/e305a765317d58d60b2b01679a3a51a52f673e4b)
- added missing ignores [`42048e9`](https://github.com/karmaniverous/entity-manager/commit/42048e933ceb7ada992c813ffea9ed283c783f83)
- try eliminating module property [`67692c0`](https://github.com/karmaniverous/entity-manager/commit/67692c0d644d2edf26c0d5b61b9b1ea799b3d1b1)
- initial commit [`158622c`](https://github.com/karmaniverous/entity-manager/commit/158622c02a6b33bbb9382c91e177939d948fd9f6)

### [v2.0.0](https://github.com/karmaniverous/entity-manager/compare/v1.0.0...v2.0.0)

> 25 March 2023

- added options params to query function [`1c4ec36`](https://github.com/karmaniverous/entity-manager/commit/1c4ec36a9975f6baedbc34a4138f17628d2dabd1)
- Release 2.0.0 [`d7ce929`](https://github.com/karmaniverous/entity-manager/commit/d7ce9293f39df0d6af1a5363535183aec132475e)

### [v1.0.0](https://github.com/karmaniverous/entity-manager/compare/v0.6.9...v1.0.0)

> 25 March 2023

- Initial commit [`ab7a546`](https://github.com/karmaniverous/entity-manager/commit/ab7a546c405e44552f4ee9b0e348cc8684b6ce7c)
- refactored to EntityManager with private class [`e4cadc9`](https://github.com/karmaniverous/entity-manager/commit/e4cadc9237c1550708d56565ffbbf53a259a74e1)
- refactored to shard-key-manager [`89ae74b`](https://github.com/karmaniverous/entity-manager/commit/89ae74b0955db6731576faf22ecb0e1f6ed46559)
- switched to faster hash algo [`369d6bc`](https://github.com/karmaniverous/entity-manager/commit/369d6bc22512cf58916551569cd2c8312077a038)
- added EntityManager methods [`d9aefbf`](https://github.com/karmaniverous/entity-manager/commit/d9aefbf358ea5d2d90ecb4ddc9f769e68c9beb94)
- readability [`1ebed3d`](https://github.com/karmaniverous/entity-manager/commit/1ebed3de130d85b7dc7dbf5d5af1966eea281d1e)
- updated npmenclature [`f5563fb`](https://github.com/karmaniverous/entity-manager/commit/f5563fb1d3ca1db715533f61c2c44281e59d7340)
- basic config [`4244f4b`](https://github.com/karmaniverous/entity-manager/commit/4244f4b7f0baf12fb7e39f00103549899ed9e775)
- added query method [`f71ad6b`](https://github.com/karmaniverous/entity-manager/commit/f71ad6b436072128d0e70b743e851730c50e568f)
- updated docs [`a919b4c`](https://github.com/karmaniverous/entity-manager/commit/a919b4c12c515f8d49ddaba6b012df9b80e84214)
- added jsonschema tests [`94f9c11`](https://github.com/karmaniverous/entity-manager/commit/94f9c11ca8b22439f80fc6ee0c3c7e1b020b5478)
- update docs [`872e5c6`](https://github.com/karmaniverous/entity-manager/commit/872e5c65bf7bb4038d91961c1aaf15debb8c15e9)
- tested bumped keyspaces [`23172fb`](https://github.com/karmaniverous/entity-manager/commit/23172fb5c41b665ecfd1d05092ad32e5909aed5e)
- Added removeKeys method [`8166f1e`](https://github.com/karmaniverous/entity-manager/commit/8166f1e11541b846f4fa79dcf030d4726e9be60f)
- switched sn2u to sn2n [`7c2610c`](https://github.com/karmaniverous/entity-manager/commit/7c2610cd0895f7ae1636fb9a5e1af7c6a0497c0e)
- updated docs [`f0c464e`](https://github.com/karmaniverous/entity-manager/commit/f0c464e8837ab3ca8ac792cbc875f555f714850a)
- reversed keyToken & item arguments [`ec333f5`](https://github.com/karmaniverous/entity-manager/commit/ec333f555fcd035e6ddc6fdb681d313ce27c4856)
- improved logging [`128aae9`](https://github.com/karmaniverous/entity-manager/commit/128aae96b3f62bdc196065b69c0a37b1c91dd84a)
- converted addKeys to non-mutating logic [`03cc225`](https://github.com/karmaniverous/entity-manager/commit/03cc225db1221e26843a5dbc32b614841e8dfce9)
- refactor shardPageKeys to pageKeys [`408bb66`](https://github.com/karmaniverous/entity-manager/commit/408bb66d8e1cbc65cd7587e84142c2dc1f633903)
- eliminated lodash chaining [`4c53e5d`](https://github.com/karmaniverous/entity-manager/commit/4c53e5dbcf1f5fb5b4cd08cc70fa7f386a168f7c)
- doc update [`b1737a2`](https://github.com/karmaniverous/entity-manager/commit/b1737a2005a85ab1d627243f631c7715716ea829)
- renamed to shard-manager [`977e461`](https://github.com/karmaniverous/entity-manager/commit/977e4619862d006743de836e2bb65541530a755d)
- org change [`e2d582f`](https://github.com/karmaniverous/entity-manager/commit/e2d582ff1bf00135d56c914d3154f8c3ab10eec0)
- updated docs [`860d62b`](https://github.com/karmaniverous/entity-manager/commit/860d62b369157bbc207abdc7cd41dde389b03bc8)
- doc update [`f6a3165`](https://github.com/karmaniverous/entity-manager/commit/f6a316534dac674febb98891121a992ce76f171c)
- doc update [`cd5ee9c`](https://github.com/karmaniverous/entity-manager/commit/cd5ee9c90b1db7635dbcd4318fd0be89016cd035)
- doc update [`38b11dc`](https://github.com/karmaniverous/entity-manager/commit/38b11dc2ebde62addf1ee85e8db3ada18e4fd40d)
- logging [`f0dd069`](https://github.com/karmaniverous/entity-manager/commit/f0dd069560e47b0ce30b7763592179b86271b895)
- Eliminated prod dependency [`1a77c45`](https://github.com/karmaniverous/entity-manager/commit/1a77c459e948182fb428f4c4242bb6108d0b0673)
- Release 1.0.0 [`e5cffd4`](https://github.com/karmaniverous/entity-manager/commit/e5cffd4e04239d1490757a25e423bf519a09bf7b)
- Release 0.1.2-1 [`54a9bff`](https://github.com/karmaniverous/entity-manager/commit/54a9bff5d4f131cf5cfaaa4cddbb04ddfd8be4bb)
- Release 0.1.2-0 [`bfc84ef`](https://github.com/karmaniverous/entity-manager/commit/bfc84ef33e14d5ce1529b33e0d9c2db08bfe45c6)
- Release 0.1.1 [`f0aea12`](https://github.com/karmaniverous/entity-manager/commit/f0aea12911e4594f24dda65f741c14f5873637d0)
- Release 0.1.0 [`a6c327c`](https://github.com/karmaniverous/entity-manager/commit/a6c327cedbf21e680772c11f1b46dae6e32f2309)
- Release 0.0.12 [`e2490cd`](https://github.com/karmaniverous/entity-manager/commit/e2490cdde9772a1ebea4a7fb2498d189f7d7da52)
- Release 0.0.11 [`e2b7d80`](https://github.com/karmaniverous/entity-manager/commit/e2b7d802074b6290632f1c2ce1594f22122ae648)
- Release 0.0.10 [`0143a6a`](https://github.com/karmaniverous/entity-manager/commit/0143a6a3fe3fe1aca259c72f3208abf20ffa1710)
- Release 0.0.9 [`ee3e985`](https://github.com/karmaniverous/entity-manager/commit/ee3e985967cf3861a83a7e2dab9461953bc445e3)
- updated test config obj [`5b654ce`](https://github.com/karmaniverous/entity-manager/commit/5b654ce3bd7bde3c7f34bd0ce6f66612371c10ce)
- Release 0.0.8 [`bd88dda`](https://github.com/karmaniverous/entity-manager/commit/bd88dda2436c257f2cc8d77014660bcd892d29cb)
- Release 0.0.7 [`6932a79`](https://github.com/karmaniverous/entity-manager/commit/6932a79d0ebee6d34b7044e73df0c0c745b7beae)
- Release 0.0.6 [`0d1b776`](https://github.com/karmaniverous/entity-manager/commit/0d1b776b3dd110b58d1ff46699041a8b91d76db7)
- doc update [`653beb9`](https://github.com/karmaniverous/entity-manager/commit/653beb92905d08e0ebbcb018302a897ea3b6accb)
- Release 0.0.5 [`2584f3c`](https://github.com/karmaniverous/entity-manager/commit/2584f3c33f16f21aa44dc83d23614c0100164aec)
- Release 0.0.4 [`89eebda`](https://github.com/karmaniverous/entity-manager/commit/89eebda8cf37cec2741b01d57ca7ba0b55e6104b)
- Release 0.0.3 [`78b8a8d`](https://github.com/karmaniverous/entity-manager/commit/78b8a8d8d50e68dbc828199c3fb96502bfbae7b0)
- doc update [`3c654ce`](https://github.com/karmaniverous/entity-manager/commit/3c654ce62a0d7adf4850e0b84d77f57df3a2fcbf)
- Release 0.0.2 [`978d64e`](https://github.com/karmaniverous/entity-manager/commit/978d64e855bf4441e88a8eacab659af6b914cdda)
- Release 0.0.1 [`8d4fdbd`](https://github.com/karmaniverous/entity-manager/commit/8d4fdbd5cf046123f3c49772b49c94cd260d6a68)
- delete nil shard keys [`28650fe`](https://github.com/karmaniverous/entity-manager/commit/28650fef1078b4fa1830f4988537f7cc54f4d8dd)
- docs update [`2ad2ad6`](https://github.com/karmaniverous/entity-manager/commit/2ad2ad64668387e972bbba6fce030af56fb1ea91)
- doc update [`335adb1`](https://github.com/karmaniverous/entity-manager/commit/335adb118b7e6a6adcc98d10f573b59239952007)
- updated docs [`e7dbe40`](https://github.com/karmaniverous/entity-manager/commit/e7dbe40076a8aa7a34b89f8f164c899ade625889)
- doc update [`80afcac`](https://github.com/karmaniverous/entity-manager/commit/80afcaca0284155f062cf4d657ae254134794e06)
- fixed test error [`ec5c5d2`](https://github.com/karmaniverous/entity-manager/commit/ec5c5d225b05ec9315e8969db26c8cc43e533d81)
- removed bin entry point [`e5fff10`](https://github.com/karmaniverous/entity-manager/commit/e5fff10be1290290afaf482ca96a7cb5c25176d6)
- fixed getShardKeySpace [`fbaebd6`](https://github.com/karmaniverous/entity-manager/commit/fbaebd606dc346c9cf599dd5e6500081d265393d)

#### [v0.6.9](https://github.com/karmaniverous/entity-manager/compare/v0.6.8...v0.6.9)

> 25 August 2024

- Extended tsdoc to support typedoc [`815a016`](https://github.com/karmaniverous/entity-manager/commit/815a016664778bc402c8ba4ff05660650bc75419)
- chore: release v0.6.9 [`6556fa9`](https://github.com/karmaniverous/entity-manager/commit/6556fa9c682227da8c010bca28c31056d61dbba1)
- updated docs [`615e677`](https://github.com/karmaniverous/entity-manager/commit/615e67799c7a79eb2205a3983fc081926cd81bec)

#### [v0.6.8](https://github.com/karmaniverous/entity-manager/compare/v0.6.7...v0.6.8)

> 25 August 2024

- typedoc site [`1b72314`](https://github.com/karmaniverous/entity-manager/commit/1b7231495f944192d9a9029c20afb3b914c7a579)
- updated dependencies [`e8ae168`](https://github.com/karmaniverous/entity-manager/commit/e8ae168890a2524f2ee910b833e261a202bffeea)
- chore: release v0.4.1 [`1a536c4`](https://github.com/karmaniverous/entity-manager/commit/1a536c49adfbe23b568391483bc3566fd758b6ca)
- updated dependencies [`389adf9`](https://github.com/karmaniverous/entity-manager/commit/389adf9de4245fec32873a17cebb3421299c2482)
- updated dependencies [`e8ac834`](https://github.com/karmaniverous/entity-manager/commit/e8ac83478e48cd10d3cc14ad06057bac9e1f6b05)
- updated dependencies [`99c9c0c`](https://github.com/karmaniverous/entity-manager/commit/99c9c0c9353bcdb21c6dbe75be0bebdb54dd2ae6)
- updated docs [`b9b34bf`](https://github.com/karmaniverous/entity-manager/commit/b9b34bf7d22956526159d6e7dc2eeda26de3018c)
- [GH-4] Added tslog logging [`60c48ef`](https://github.com/karmaniverous/entity-manager/commit/60c48ef23a40350542833e1f7a3f68760c2b9bbf)
- added .env.local support [`37d4471`](https://github.com/karmaniverous/entity-manager/commit/37d447192604f69c4a7d2bba14ffdea46a828c7b)
- Added noderesolve & incremental builds [`061ee42`](https://github.com/karmaniverous/entity-manager/commit/061ee428d801e713bf44e48a2c6a64cb7930ae2c)
- updated dependencies [`d852b80`](https://github.com/karmaniverous/entity-manager/commit/d852b80d7bde2d739c612936ee7be048d092c8bc)
- added changelog to project docs [`6e5b24f`](https://github.com/karmaniverous/entity-manager/commit/6e5b24f1b9e306d6ce81644c4579d894aebf1f20)
- added typedoc support [`2abbe30`](https://github.com/karmaniverous/entity-manager/commit/2abbe306823624885a1610f246236fcd978844f6)
- [GH-6] added CLI support [`b83ec5e`](https://github.com/karmaniverous/entity-manager/commit/b83ec5e209a2e73b00b3d6a7c84d964f22bd74fd)
- updated docs & recommended extensions [`1473d9e`](https://github.com/karmaniverous/entity-manager/commit/1473d9e4c2d392feb710360dabe9e7db391b2234)
- Eliminated tslog & preserved dependency packages [`a028aaa`](https://github.com/karmaniverous/entity-manager/commit/a028aaa1ac13045de9718a306172dfbb61a7c49b)
- [GH-6] wip [`181110c`](https://github.com/karmaniverous/entity-manager/commit/181110cb4e4dbc689061957afd7af5002fb4d456)
- Added FooTarget type & updated docs [`38bb40b`](https://github.com/karmaniverous/entity-manager/commit/38bb40b5d30a5b6f5bdcba7a2c90eef1687b94d3)
- [GH-14] added tsdoc support [`fc3af13`](https://github.com/karmaniverous/entity-manager/commit/fc3af138e0a7cbd9b8e97f134ee51ad76f192a5f)
- [GH-7] resolved iife build warnings [`3b969bc`](https://github.com/karmaniverous/entity-manager/commit/3b969bc2a61e72c514cf03ba1bbc08eb2c118eff)
- [GH-12] added json import support [`de6a0a9`](https://github.com/karmaniverous/entity-manager/commit/de6a0a9d70387eda9845237c45ca661b25e3976d)
- chore: release v0.6.8 [`d5bbd47`](https://github.com/karmaniverous/entity-manager/commit/d5bbd473c28c9650e8c9f24c1f9ff9055a9e948b)
- sorted json [`8ff6b7d`](https://github.com/karmaniverous/entity-manager/commit/8ff6b7ddd1d50f4e32e99cfa6270f2cf84b29d41)
- updated build script & exports [`e7b4919`](https://github.com/karmaniverous/entity-manager/commit/e7b491962cef680e5c915700fd226bff6086cf4b)
- chore: release v0.6.7 [`19e8cce`](https://github.com/karmaniverous/entity-manager/commit/19e8cce500f819bc6ad8c4ad8efe3e216a963e03)
- updated docs [`647cbda`](https://github.com/karmaniverous/entity-manager/commit/647cbda213055d4911368be9447ec34a9f95a0c3)
- updated docs [`9658479`](https://github.com/karmaniverous/entity-manager/commit/96584794c971efdae37442bbc0b37ae30d58de8d)
- update docs [`514b734`](https://github.com/karmaniverous/entity-manager/commit/514b73473037e859be976334c0e6d4eb99b6bc15)
- updated docs [`ffb67e1`](https://github.com/karmaniverous/entity-manager/commit/ffb67e18ad9730c65acf46b0a83b51cdb3d9ad06)
- chore: release v0.6.5 [`6f4a753`](https://github.com/karmaniverous/entity-manager/commit/6f4a753899d5312474ce93f30727d4c4432df13b)
- chore: release v0.6.4 [`0204710`](https://github.com/karmaniverous/entity-manager/commit/020471060ca5c5bf17c06aaa3fad78723ee44762)
- chore: release v0.6.3 [`62cac04`](https://github.com/karmaniverous/entity-manager/commit/62cac04b05683e0181d69c5ef55098316c2b86e5)
- chore: release v0.6.6 [`b69e030`](https://github.com/karmaniverous/entity-manager/commit/b69e0306148484b5a2930a1d6ca36d3c61f59026)
- added .env.local.template [`58f23df`](https://github.com/karmaniverous/entity-manager/commit/58f23df6894b251520829fa917ed752d3a798717)
- support chunked build outputs [`099097d`](https://github.com/karmaniverous/entity-manager/commit/099097dd2050b2150c6ad56beb03a039da4fb24a)
- [GH-6] updated readme [`112fe46`](https://github.com/karmaniverous/entity-manager/commit/112fe46f21a94487a4242c2782f4a9cef100ff49)
- chore: release v0.0.6 [`1b7b20e`](https://github.com/karmaniverous/entity-manager/commit/1b7b20e7404024893ac6f1bcf5bed6a944682c83)
- reordered exports [`fee56e0`](https://github.com/karmaniverous/entity-manager/commit/fee56e0011de9868b1d5a19d9a0463ef33dee580)
- bounded editor word wrap for markdown [`b4e4cd2`](https://github.com/karmaniverous/entity-manager/commit/b4e4cd2e91601ee59410386616a9af4af88cbd86)
- cjs -&gt; cts [`e31ffba`](https://github.com/karmaniverous/entity-manager/commit/e31ffbabce4f766956ca6f20e8548da8b845d848)
- Add docs commit to release script [`b49b5b6`](https://github.com/karmaniverous/entity-manager/commit/b49b5b63b374be53595f57de0828c5e4968fb577)
- updated dependencies [`14a3931`](https://github.com/karmaniverous/entity-manager/commit/14a39314d986afa2fbe2a91db6e2e6b49e17c756)
- updated docs [`277d09d`](https://github.com/karmaniverous/entity-manager/commit/277d09d92a04645e2c70838a193e9319080afbc5)
- updated docs [`60f2f17`](https://github.com/karmaniverous/entity-manager/commit/60f2f177cb927c15ede84fb6731aa3a24da8fb7e)
- [GH-6] updated README.md [`7359e0b`](https://github.com/karmaniverous/entity-manager/commit/7359e0b77bfeff6d51996d93948c5bc4df69a69a)
- updated docs [`50ca919`](https://github.com/karmaniverous/entity-manager/commit/50ca91957edc0723a98dde12dd750dc132a6d18f)
- chore: release v0.6.2 [`87ec2c7`](https://github.com/karmaniverous/entity-manager/commit/87ec2c705df5f7919e2b5f38d3abbee42e82403a)
- chore: release v0.6.1 [`0c875e5`](https://github.com/karmaniverous/entity-manager/commit/0c875e5d0e5cd4244d7331efebb6b11d2df405f4)
- chore: release v0.6.0 [`20a0c3e`](https://github.com/karmaniverous/entity-manager/commit/20a0c3e28000eaf4ad53cf4005de72ac5a4173b9)
- updated links [`fba10c8`](https://github.com/karmaniverous/entity-manager/commit/fba10c8e2b56728749dfcfa9ec57d614dbf46d4b)
- chore: release v0.5.4 [`df72f24`](https://github.com/karmaniverous/entity-manager/commit/df72f2402129d3450d2098c642d8ae16856d2626)
- chore: release v0.5.3 [`e45fdf9`](https://github.com/karmaniverous/entity-manager/commit/e45fdf96dbed50a153da5d7cb79b0d0f6f8a1617)
- chore: release v0.5.2 [`f5ce3dc`](https://github.com/karmaniverous/entity-manager/commit/f5ce3dc869d178134179a7a728d6bb2ba4a8a1bc)
- chore: release v0.4.0 [`79dafdd`](https://github.com/karmaniverous/entity-manager/commit/79dafdd31556a0266eebc9bdaa57b0e239109d1e)
- chore: release v0.3.0 [`83a5f6a`](https://github.com/karmaniverous/entity-manager/commit/83a5f6a40ebaf18d348b8e9b1f924893464dfc38)
- chore: release v0.2.1 [`7350aed`](https://github.com/karmaniverous/entity-manager/commit/7350aedd3bcfb794d2bbf58900124f65faaf59d7)
- chore: release v0.2.0 [`75b6b00`](https://github.com/karmaniverous/entity-manager/commit/75b6b0019523c82e8c90086e19c53374dacca84d)
- chore: release v0.1.0 [`092d7e5`](https://github.com/karmaniverous/entity-manager/commit/092d7e5c4e033795e492a32d94875362b7b53d05)
- chore: release v0.0.10 [`a8bb9df`](https://github.com/karmaniverous/entity-manager/commit/a8bb9df56e293838143b036c35e18813efd88419)
- chore: release v0.0.9 [`b15fae2`](https://github.com/karmaniverous/entity-manager/commit/b15fae2143949562dfc3689079ed55df49fd7380)
- chore: release v0.0.8 [`70a8576`](https://github.com/karmaniverous/entity-manager/commit/70a857621b1ff24e8826fee3bb402fe4e05e876f)
- chore: release v0.0.7 [`16ca12e`](https://github.com/karmaniverous/entity-manager/commit/16ca12eadc80ef5e828f3250f0377e110fed86f3)
- updated docs [`fdc5af8`](https://github.com/karmaniverous/entity-manager/commit/fdc5af88a9cee1b67e7ec90c723d6f13651939da)
- updated readme [`7d041b7`](https://github.com/karmaniverous/entity-manager/commit/7d041b7829649e3f09a03b414b830677c49ef8a9)
- updated docs [`97ac1a8`](https://github.com/karmaniverous/entity-manager/commit/97ac1a87fc11af2a4f6d4e332a951a66b151bd04)
- updated docs [`ba56a2b`](https://github.com/karmaniverous/entity-manager/commit/ba56a2b241fd4d38d20654d1c676bf6c16029068)
- updated docs [`3fe4f41`](https://github.com/karmaniverous/entity-manager/commit/3fe4f417d68f9403056c715c9642284fcb0fc778)
- updated docs [`9dfb15d`](https://github.com/karmaniverous/entity-manager/commit/9dfb15dce128d653d1b553ac4e5d2cabfb6a543e)
- updated docs [`b7c23a7`](https://github.com/karmaniverous/entity-manager/commit/b7c23a73cec1a6006de92614df4edd79ffc20ef9)
- updated nav [`acc0576`](https://github.com/karmaniverous/entity-manager/commit/acc057660dcfe08eea7fc8e286ca53396d0ebe7e)
- updated docs [`2fc051f`](https://github.com/karmaniverous/entity-manager/commit/2fc051f348b50a70a4117d2078cf8edbd8c7b664)
- updated readme [`c993c46`](https://github.com/karmaniverous/entity-manager/commit/c993c46403f38c86c8af55621f858319b4c38078)
- updated readme [`9d3d80e`](https://github.com/karmaniverous/entity-manager/commit/9d3d80ece0ef0713ce9821ee533de6f23a4ad2db)
- docs [`839c142`](https://github.com/karmaniverous/entity-manager/commit/839c1426ebb74b856b59a609df83b0e60c3d12f2)
- updated release script [`82eafe3`](https://github.com/karmaniverous/entity-manager/commit/82eafe3d66c41f067d428e5038a959e9cf5f4df5)
- added doc generation to relese script [`5f2e798`](https://github.com/karmaniverous/entity-manager/commit/5f2e798671a12e704d8b541bf139577247a761bb)
- Create FUNDING.yml [`fdc906a`](https://github.com/karmaniverous/entity-manager/commit/fdc906a5abc3f9f897eef26c033dc9c5473237c4)
- updated docs links [`86a69bc`](https://github.com/karmaniverous/entity-manager/commit/86a69bc61eb9e55654826270197431bbc7bfda10)
- fixed home link [`649b170`](https://github.com/karmaniverous/entity-manager/commit/649b170233503cf25cb507d7255dc190ab3149aa)
- Update README.md [`46876bd`](https://github.com/karmaniverous/entity-manager/commit/46876bdf3df7dfb434c4e45c36cce7ca2907c39f)
- prerelease script bugfix [`77197a7`](https://github.com/karmaniverous/entity-manager/commit/77197a7d2581a674282069948e24b495a004d2fb)
- updated readme [`5487cee`](https://github.com/karmaniverous/entity-manager/commit/5487cee36487f659b62a551850e4e9ee5687dbe8)
- updated .gitignore [`5644677`](https://github.com/karmaniverous/entity-manager/commit/564467754d8e35527fcb2bdb6a8c6a6692234982)
- added missing ignores [`b64353c`](https://github.com/karmaniverous/entity-manager/commit/b64353c4a2d6b99dd21d26fbae98dacb26ffa8b6)

#### [v0.6.7](https://github.com/karmaniverous/entity-manager/compare/v0.6.6...v0.6.7)

> 25 August 2024

- typedoc site [`0d673d4`](https://github.com/karmaniverous/entity-manager/commit/0d673d4f27f18c6ec7104b657b244e15c3535c0c)
- updated dependencies [`d40a21e`](https://github.com/karmaniverous/entity-manager/commit/d40a21ea3bd44ce0d078eb3fc023fe1893351318)
- chore: release v0.4.1 [`b006090`](https://github.com/karmaniverous/entity-manager/commit/b006090636f330446ccd3475f80a132ac3376af0)
- updated dependencies [`c306f9e`](https://github.com/karmaniverous/entity-manager/commit/c306f9e51a4efb398740386e3cdea624fa49c22a)
- updated dependencies [`3af7da2`](https://github.com/karmaniverous/entity-manager/commit/3af7da23e61736c026971e1bac95695c663e3757)
- updated docs [`10d7df2`](https://github.com/karmaniverous/entity-manager/commit/10d7df25da12e14918382550f3fbbae891581ccb)
- added .env.local support [`1a5fa71`](https://github.com/karmaniverous/entity-manager/commit/1a5fa711efda0822758ef3f241303a5c379d5484)
- added typedoc support [`de468bc`](https://github.com/karmaniverous/entity-manager/commit/de468bc2f29535809c73ffd604a569c1dba88166)
- Eliminated tslog & preserved dependency packages [`8659847`](https://github.com/karmaniverous/entity-manager/commit/865984738e5cc7b74730ef5619c1186c5fd7f695)
- Added FooTarget type & updated docs [`204d416`](https://github.com/karmaniverous/entity-manager/commit/204d416d4ef1aeb0703ebb9dbabd2dd90d058fd9)
- chore: release v0.6.7 [`9360c22`](https://github.com/karmaniverous/entity-manager/commit/9360c22f83506ef047e29da342aac4f2dc5c694f)
- updated docs [`3737cf4`](https://github.com/karmaniverous/entity-manager/commit/3737cf4f2552e27f1b611a68ca1c6200637f172a)
- updated docs [`4b14898`](https://github.com/karmaniverous/entity-manager/commit/4b148980581a7c13bf67b52ca11c430b9028b416)
- update docs [`a20979b`](https://github.com/karmaniverous/entity-manager/commit/a20979bb884ba8e1a0096262a89c7b489f02cf2d)
- chore: release v0.6.5 [`27c91d6`](https://github.com/karmaniverous/entity-manager/commit/27c91d647ec1bc091507888c46c13039b8679f86)
- chore: release v0.6.4 [`647c1da`](https://github.com/karmaniverous/entity-manager/commit/647c1dab489f35c8957710e8525b3d6ad25a8239)
- chore: release v0.6.3 [`f1d30a3`](https://github.com/karmaniverous/entity-manager/commit/f1d30a32e59b9e891d60ee2762eb673520150f50)
- chore: release v0.6.6 [`c3fc0ed`](https://github.com/karmaniverous/entity-manager/commit/c3fc0ed5116acc80493b01a9689e4eef7cc42703)
- added .env.local.template [`25ea48d`](https://github.com/karmaniverous/entity-manager/commit/25ea48d7b52cc8f43c78fecc9fffc2a18254bb6f)
- support chunked build outputs [`8204d5f`](https://github.com/karmaniverous/entity-manager/commit/8204d5f8fc09d81a71bd336b64fede2136007340)
- Add docs commit to release script [`6c3e156`](https://github.com/karmaniverous/entity-manager/commit/6c3e156d720d6651d022cce52331db1b9facff4a)
- updated dependencies [`bce6de4`](https://github.com/karmaniverous/entity-manager/commit/bce6de4cefbae08da1925c4bed586d28012cc5ea)
- updated docs [`7106dcd`](https://github.com/karmaniverous/entity-manager/commit/7106dcdbdac635079bf06a1b8fda71fe9c6765c1)
- updated docs [`6565c9f`](https://github.com/karmaniverous/entity-manager/commit/6565c9fa3e4df4e48e44701180f316575db63847)
- chore: release v0.6.2 [`74488da`](https://github.com/karmaniverous/entity-manager/commit/74488da5ac3f800d9c8e865a41e863974078fd77)
- chore: release v0.6.1 [`bd0a47c`](https://github.com/karmaniverous/entity-manager/commit/bd0a47c559fb2b51963490620c53904c3485c163)
- chore: release v0.6.0 [`8bf28b7`](https://github.com/karmaniverous/entity-manager/commit/8bf28b7ac2b4ebabbbbd816c4ece6ebc021baec2)
- updated links [`2513350`](https://github.com/karmaniverous/entity-manager/commit/25133508a6e1983302fda2c1b086b6836beb9b25)
- chore: release v0.5.4 [`2580fc0`](https://github.com/karmaniverous/entity-manager/commit/2580fc0007562855c7e11051aa87a4e7d7371b3e)
- chore: release v0.5.3 [`8eab606`](https://github.com/karmaniverous/entity-manager/commit/8eab60622c9e18bd058f97f7a80830c78fe0d88d)
- chore: release v0.5.2 [`cfdf632`](https://github.com/karmaniverous/entity-manager/commit/cfdf6328f80f30ab2e1f7f1f4b407efa702c8c36)
- updated docs [`2de51f0`](https://github.com/karmaniverous/entity-manager/commit/2de51f048d3831cbeedefde7493ca1164f819297)
- updated docs [`4b6a2a8`](https://github.com/karmaniverous/entity-manager/commit/4b6a2a8110152aa8798de9dc13623e761cb888b5)
- updated docs [`bc4dd41`](https://github.com/karmaniverous/entity-manager/commit/bc4dd4135a35c31a675763723e8022b45a8f0c11)
- updated docs [`9fb589c`](https://github.com/karmaniverous/entity-manager/commit/9fb589c5ec2645eae24b4acf1c514952d560d377)
- updated docs [`26eeb64`](https://github.com/karmaniverous/entity-manager/commit/26eeb64d20fa3a601883bcf8354f951ae9f9f235)
- updated docs [`77a3268`](https://github.com/karmaniverous/entity-manager/commit/77a32681a9734d47eee83f9b4f23cc4fab928d1a)
- updated nav [`c307986`](https://github.com/karmaniverous/entity-manager/commit/c3079864019772ed63d817e7c97abb1259311f3b)
- updated docs [`876c030`](https://github.com/karmaniverous/entity-manager/commit/876c03018d7810af1735d18f25b483b39a7de4a9)
- updated release script [`5a0d3b0`](https://github.com/karmaniverous/entity-manager/commit/5a0d3b0281326475ebf3a92a542c38d775467895)
- added doc generation to relese script [`a548d8e`](https://github.com/karmaniverous/entity-manager/commit/a548d8ef24f9255b6f1b54c08a427b2024b94a6b)
- Create FUNDING.yml [`d9f318a`](https://github.com/karmaniverous/entity-manager/commit/d9f318a4f58efb0579932fd9c2d9a9b4eac2fd49)
- updated docs links [`818632a`](https://github.com/karmaniverous/entity-manager/commit/818632afd3d5585ba0aa2281507dd390d123885f)
- fixed home link [`bfbac17`](https://github.com/karmaniverous/entity-manager/commit/bfbac17b907906191309f308bf7dd2e5d1cfac86)
- Update README.md [`d8322ef`](https://github.com/karmaniverous/entity-manager/commit/d8322ef62cef4127ef799245562ed85352c9e3c1)
- prerelease script bugfix [`792544b`](https://github.com/karmaniverous/entity-manager/commit/792544bb8d1f0a6b48b86f54c0363904c2685604)
- updated .gitignore [`171e552`](https://github.com/karmaniverous/entity-manager/commit/171e5522094112f4957835f43698fbad13d4361d)

#### [v0.6.6](https://github.com/karmaniverous/entity-manager/compare/v0.6.5...v0.6.6)

> 25 August 2024

- chore: release v0.6.6 [`fa35411`](https://github.com/karmaniverous/entity-manager/commit/fa35411eedad019ef9f0515b0aa46cb69fa95f71)
- updated docs [`3d24d09`](https://github.com/karmaniverous/entity-manager/commit/3d24d09850ec014f8ae2da52d71e2694000a85d5)

#### [v0.6.5](https://github.com/karmaniverous/entity-manager/compare/v0.6.4...v0.6.5)

> 25 August 2024

- chore: release v0.6.5 [`acd8a3e`](https://github.com/karmaniverous/entity-manager/commit/acd8a3ed9b859165b913ef8c24801ffb8a950c43)
- updated docs [`804835b`](https://github.com/karmaniverous/entity-manager/commit/804835b1f417c6c44721768f9a5db97d49ee0211)

#### [v0.6.4](https://github.com/karmaniverous/entity-manager/compare/v0.6.3...v0.6.4)

> 25 August 2024

- chore: release v0.6.4 [`9e20a8d`](https://github.com/karmaniverous/entity-manager/commit/9e20a8d493defacc7f133bd986f287a768d792e1)
- added .env.local.template [`db25fdd`](https://github.com/karmaniverous/entity-manager/commit/db25fddcf4fa408811172e9470a11f9263871a97)
- updated docs [`73668b5`](https://github.com/karmaniverous/entity-manager/commit/73668b50a9d040061113e05a9745548fb2857f73)

#### [v0.6.3](https://github.com/karmaniverous/entity-manager/compare/v0.6.2...v0.6.3)

> 25 August 2024

- added .env.local support [`b8d4676`](https://github.com/karmaniverous/entity-manager/commit/b8d4676a79d95488ea3d2980608d148adc280285)
- chore: release v0.6.3 [`0f3920c`](https://github.com/karmaniverous/entity-manager/commit/0f3920c5d0e882e9309638119aedddf6ddc88dd7)
- updated docs [`a836efa`](https://github.com/karmaniverous/entity-manager/commit/a836efaefde9a7ff6263788feb14a2f00bea070b)

#### [v0.6.2](https://github.com/karmaniverous/entity-manager/compare/v0.6.1...v0.6.2)

> 25 August 2024

- updated docs [`f7b19a2`](https://github.com/karmaniverous/entity-manager/commit/f7b19a2f7e4143d3d852b7d0666b94dea725037e)
- updated docs [`846fc2c`](https://github.com/karmaniverous/entity-manager/commit/846fc2cc3667f12d3a481b1d2ed034cd3f65d114)
- chore: release v0.6.2 [`618367c`](https://github.com/karmaniverous/entity-manager/commit/618367c6a4064836a70500aadc61fe436ff8214b)
- updated docs [`0a9691d`](https://github.com/karmaniverous/entity-manager/commit/0a9691dffe449ad1b680a4a07fed6a389125fcc3)
- updated nav [`3bf5f3b`](https://github.com/karmaniverous/entity-manager/commit/3bf5f3b90cf72f7e6322340c1a223e7c0ad23104)
- updated release script [`0309b50`](https://github.com/karmaniverous/entity-manager/commit/0309b507142a96d93aff07bd634c50f6467fae03)

#### [v0.6.1](https://github.com/karmaniverous/entity-manager/compare/v0.6.0...v0.6.1)

> 24 August 2024

- updated docs [`379b500`](https://github.com/karmaniverous/entity-manager/commit/379b500c127534c9c737d1d81e9a281753e30618)
- updated docs [`0d7a845`](https://github.com/karmaniverous/entity-manager/commit/0d7a845cf5d050ec21d7508a2e4a5ecbb3654f40)
- chore: release v0.6.1 [`4694f71`](https://github.com/karmaniverous/entity-manager/commit/4694f714a8e1ed901754b38eb255f7c9961068bf)
- updated docs links [`08dfecd`](https://github.com/karmaniverous/entity-manager/commit/08dfecd7a1b021b8ac13331245620ea17627f09a)
- fixed home link [`6f5c3f6`](https://github.com/karmaniverous/entity-manager/commit/6f5c3f6eda58a4b4f79fec8292106a475b0bd132)

#### [v0.6.0](https://github.com/karmaniverous/entity-manager/compare/v0.5.4...v0.6.0)

> 24 August 2024

- typedoc site [`bd18a77`](https://github.com/karmaniverous/entity-manager/commit/bd18a776526c45c861376cce4843620750fd459f)
- updated docs [`7eef8ac`](https://github.com/karmaniverous/entity-manager/commit/7eef8ac44340513bbf1c4759bdf12de600529bee)
- Added FooTarget type & updated docs [`b23cb7b`](https://github.com/karmaniverous/entity-manager/commit/b23cb7b41a8a265c0963389a7b7933f610f21f87)
- update docs [`c877f91`](https://github.com/karmaniverous/entity-manager/commit/c877f915605fcecad5511777fc57b5fca0b1e8cd)
- Add docs commit to release script [`06307d5`](https://github.com/karmaniverous/entity-manager/commit/06307d5fe405ec40eac86c3a5bf1a30db17ca88c)
- chore: release v0.6.0 [`9e8dd35`](https://github.com/karmaniverous/entity-manager/commit/9e8dd359c97f45aac1432c82d08034cc35647992)
- updated links [`94859fc`](https://github.com/karmaniverous/entity-manager/commit/94859fc241d64009799325d22662b343d38ea313)
- updated docs [`8419afc`](https://github.com/karmaniverous/entity-manager/commit/8419afc524ac83151def763165502f6aa385caf0)

#### [v0.5.4](https://github.com/karmaniverous/entity-manager/compare/v0.5.3...v0.5.4)

> 23 August 2024

- added typedoc support [`90bab5f`](https://github.com/karmaniverous/entity-manager/commit/90bab5f7b2ecb728a419180190e15d00fb5918cb)
- chore: release v0.5.4 [`a57d7ab`](https://github.com/karmaniverous/entity-manager/commit/a57d7ab818ce07c01cd64794d023c19d5f484b9c)
- added doc generation to relese script [`7997d58`](https://github.com/karmaniverous/entity-manager/commit/7997d58627266140b64d5a792f7323128ac2ef00)

#### [v0.5.3](https://github.com/karmaniverous/entity-manager/compare/v0.5.2...v0.5.3)

> 23 August 2024

- updated dependencies [`9bcbc3c`](https://github.com/karmaniverous/entity-manager/commit/9bcbc3c6423d26f4407545f9bccd851c3e03d968)
- updated dependencies [`9925c26`](https://github.com/karmaniverous/entity-manager/commit/9925c262c9a7d560c678eedc1da7328e1e172af5)
- Eliminated tslog & preserved dependency packages [`8e5fb1d`](https://github.com/karmaniverous/entity-manager/commit/8e5fb1d759727814f272f5ee09af28aebfefd19f)
- support chunked build outputs [`e06e7ce`](https://github.com/karmaniverous/entity-manager/commit/e06e7ce88bad0807f34c76e3a095712e00df8911)
- updated dependencies [`c4f7702`](https://github.com/karmaniverous/entity-manager/commit/c4f7702052bbed1ab7e5c0bb7d351aed7e98452d)
- chore: release v0.5.3 [`6b48ab6`](https://github.com/karmaniverous/entity-manager/commit/6b48ab628b1837193b0e3d61481c3633a39e9e78)
- Create FUNDING.yml [`1612db7`](https://github.com/karmaniverous/entity-manager/commit/1612db7f13a2367c6f0e7828a04660c3a1d8465b)
- prerelease script bugfix [`c5cdbde`](https://github.com/karmaniverous/entity-manager/commit/c5cdbde74eb091d6fa9ce5a9bb62aab8065be0a8)
- Update README.md [`d04c08b`](https://github.com/karmaniverous/entity-manager/commit/d04c08bd2b1e995ffea209929577d160db759582)
- updated .gitignore [`a085f65`](https://github.com/karmaniverous/entity-manager/commit/a085f6506af19097447e899ebe918a4d8d15678d)

#### [v0.5.2](https://github.com/karmaniverous/entity-manager/compare/v0.5.1...v0.5.2)

> 3 July 2024

- updated dependencies [`b4da11c`](https://github.com/karmaniverous/entity-manager/commit/b4da11c8e834d03ed052022599879d1632c8b683)
- chore: release v0.5.2 [`5345d98`](https://github.com/karmaniverous/entity-manager/commit/5345d98322a3a6053cf90e876f83dfdf25ec538e)

#### [v0.5.1](https://github.com/karmaniverous/entity-manager/compare/v0.5.0...v0.5.1)

> 19 June 2024

- restored package.json breakage [`28dd47f`](https://github.com/karmaniverous/entity-manager/commit/28dd47f6788cb49d28f64bd26f17f09246ba59a5)
- chore: release v0.5.1 [`75f305b`](https://github.com/karmaniverous/entity-manager/commit/75f305b6fdde65fe990b2c38ad8f959bbc6e99c4)

#### [v0.5.0](https://github.com/karmaniverous/entity-manager/compare/v0.4.1...v0.5.0)

> 9 June 2024

- [GH-16] reset version [`#18`](https://github.com/karmaniverous/entity-manager/pull/18)
- Feature/GH-16-support-prerelease-from-any-branch [`#17`](https://github.com/karmaniverous/entity-manager/pull/17)
- chore: release v0.5.0 [`a2bdf4f`](https://github.com/karmaniverous/entity-manager/commit/a2bdf4fa1ffbce9a72cef5f28435435329ead6e8)
- [GH-16] Merge branch 'main' into feature/GH-16-support-prerelease-from-any-branch [`64d78de`](https://github.com/karmaniverous/entity-manager/commit/64d78de210f06bb23f78c6129f72dd493f16b466)
- [GH-16] added release:pre script [`275825d`](https://github.com/karmaniverous/entity-manager/commit/275825d747f25af09cb20fda13959032790689c6)
- updated package meta [`b514607`](https://github.com/karmaniverous/entity-manager/commit/b51460736b0dbdd192cf01e11f271311d80f659c)
- chore: release v2.0.6 [`7e921ec`](https://github.com/karmaniverous/entity-manager/commit/7e921ec52d99474813a397bdb14d1429d7ee6f76)
- [GH-16] updated readme [`3ce1379`](https://github.com/karmaniverous/entity-manager/commit/3ce1379b66157813843bd9ea852daa5812d0df03)

#### [v0.4.1](https://github.com/karmaniverous/entity-manager/compare/v0.4.0...v0.4.1)

> 6 June 2024

- updated dependencies [`ca882a3`](https://github.com/karmaniverous/entity-manager/commit/ca882a3d59eb145a6a58e366ce3e91eff49a3416)
- reordered exports [`42b7007`](https://github.com/karmaniverous/entity-manager/commit/42b70077df4899d98d5e536d3e27017c43a11df1)
- chore: release v0.4.1 [`383286d`](https://github.com/karmaniverous/entity-manager/commit/383286d0c56d6fe08f709fce20e8b65e47eef766)
- updated readme [`7932290`](https://github.com/karmaniverous/entity-manager/commit/79322906a82e72d7ee348924b97f246634b143d9)
- updated readme [`cb38a92`](https://github.com/karmaniverous/entity-manager/commit/cb38a92ed1ef3c6466d654e1b16ec8f71f8bf2b7)
- updated readme [`dff012e`](https://github.com/karmaniverous/entity-manager/commit/dff012e6d38677a5075fe713bcc4abc10f99fcf7)

#### [v0.4.0](https://github.com/karmaniverous/entity-manager/compare/v0.3.0...v0.4.0)

> 5 May 2024

- [GH-14] added tsdoc support [`#15`](https://github.com/karmaniverous/entity-manager/pull/15)
- [GH-12] added json import support [`#13`](https://github.com/karmaniverous/entity-manager/pull/13)
- updated dependencies [`ceb4894`](https://github.com/karmaniverous/entity-manager/commit/ceb489482c55cee21edeea6e5701db29dd311635)
- chore: release v0.4.0 [`c6b73ed`](https://github.com/karmaniverous/entity-manager/commit/c6b73ed5ceb0745e972dac7d4de7bd52c19e6d26)

#### [v0.3.0](https://github.com/karmaniverous/entity-manager/compare/v0.2.1...v0.3.0)

> 1 May 2024

- Feature/gh-6-add-cli-support [`#9`](https://github.com/karmaniverous/entity-manager/pull/9)
- [GH-6] added CLI support [`b2bfd0c`](https://github.com/karmaniverous/entity-manager/commit/b2bfd0ca39e1fdcd8865fcaf039a450da986533f)
- [GH-6] wip [`27aa2ee`](https://github.com/karmaniverous/entity-manager/commit/27aa2ee57f706c0360a64e9d6419b319db0e9598)
- [GH-7] resolved iife build warnings [`7b3e30a`](https://github.com/karmaniverous/entity-manager/commit/7b3e30aed09b7f921c3245377e67a04b155eb28b)
- [GH-6] updated readme [`79457cd`](https://github.com/karmaniverous/entity-manager/commit/79457cd2e0b8c67d55353a44f64b76c2bedbebc3)
- [GH-6] updated README.md [`87a0062`](https://github.com/karmaniverous/entity-manager/commit/87a00623bfce8a5f3786113404b858fed6e84469)
- chore: release v0.3.0 [`6b0b6f3`](https://github.com/karmaniverous/entity-manager/commit/6b0b6f3098310beb76c1fd683f5868a3d6689b2a)
- [GH-6] Merge branch 'main' into feature/gh-6-add-cli-support [`c0c7596`](https://github.com/karmaniverous/entity-manager/commit/c0c7596cdcd2fbb318e64ed436a9d309d22d90b9)
- Merge pull request #8 from karmaniverous/bugfix/GH-7-iife-build-warnings [`0014028`](https://github.com/karmaniverous/entity-manager/commit/0014028b420c262a53346a29e83eec665b0a3f69)

#### [v0.2.1](https://github.com/karmaniverous/entity-manager/compare/v0.2.0...v0.2.1)

> 25 April 2024

- Added noderesolve & incremental builds [`de7ce79`](https://github.com/karmaniverous/entity-manager/commit/de7ce7922f698a90b6db222fede70c4be5586ac3)
- bounded editor word wrap for markdown [`327637a`](https://github.com/karmaniverous/entity-manager/commit/327637a0a412475840fe1f4db16164eb277d01ef)
- chore: release v0.2.1 [`b154990`](https://github.com/karmaniverous/entity-manager/commit/b1549907847ba369d808b6f9e3baf92c436acb24)

#### [v0.2.0](https://github.com/karmaniverous/entity-manager/compare/v0.1.2-1...v0.2.0)

> 21 April 2024

- [GH-4] Added tslog logging [`#5`](https://github.com/karmaniverous/entity-manager/pull/5)
- [GH-1] updated release scripts [`#3`](https://github.com/karmaniverous/entity-manager/pull/3)
- [GH-1] installed & configured release-it [`#2`](https://github.com/karmaniverous/entity-manager/pull/2)
- wip [`1b1d022`](https://github.com/karmaniverous/entity-manager/commit/1b1d022e29f058aa8a5378831e489a426bcc66a9)
- initial commit [`d8b4846`](https://github.com/karmaniverous/entity-manager/commit/d8b484653f8f018ff9835c4a3b88835d95332b3e)
- installed & configured rollup [`b9ac884`](https://github.com/karmaniverous/entity-manager/commit/b9ac8849a3858bcc8e1f676deab48791cbde8452)
- installed prettier & configured eslint [`0bb0e54`](https://github.com/karmaniverous/entity-manager/commit/0bb0e540e8c718863f95e55cf119e032d2ba1aaf)
- updated docs & recommended extensions [`da662d4`](https://github.com/karmaniverous/entity-manager/commit/da662d4bd4bd989a2d82b19aa5995951d268b8d1)
- got tests working [`f20a6d9`](https://github.com/karmaniverous/entity-manager/commit/f20a6d9994e7272c41598aedfeb282172f38d860)
- got code coverage working [`e2ca955`](https://github.com/karmaniverous/entity-manager/commit/e2ca95524ff0d43e06a724b92b90ebf67e7cb35b)
- sorted json [`20dc1d1`](https://github.com/karmaniverous/entity-manager/commit/20dc1d1c1e2092c677cebfb1e66157b9498f9a12)
- updated build script & exports [`9f90d08`](https://github.com/karmaniverous/entity-manager/commit/9f90d08f2ce74c241aa05dc04d92a65b92963091)
- updated package.json [`f4ae65b`](https://github.com/karmaniverous/entity-manager/commit/f4ae65bf46deaa271970f145a238a843d8f9a8da)
- updated docs [`ca8c1e5`](https://github.com/karmaniverous/entity-manager/commit/ca8c1e5182a1f1ec5010c99f399d469bdfc0f14d)
- cjs -&gt; cts [`eafc162`](https://github.com/karmaniverous/entity-manager/commit/eafc162462b14da0015e8c7ad32aa9fd01cb5930)
- fleshed out exports [`0cf492e`](https://github.com/karmaniverous/entity-manager/commit/0cf492e95c4bf4483334d73f3c034c281bed1efd)
- chore: release v0.2.0 [`67f50b4`](https://github.com/karmaniverous/entity-manager/commit/67f50b4e285857e5e52d317694dc6975b053d382)
- chore: release v0.1.0 [`47df9d0`](https://github.com/karmaniverous/entity-manager/commit/47df9d0e5d35337e240ac6aa720b920bb558fab2)
- chore: release v0.0.10 [`b0c409c`](https://github.com/karmaniverous/entity-manager/commit/b0c409c6da61b6732bd2ab45abfd9c72b510f2cb)
- chore: release v0.0.9 [`5ab12ed`](https://github.com/karmaniverous/entity-manager/commit/5ab12edbacc9093821191ad1d85532e5630b4b7a)
- chore: release v0.0.8 [`8812313`](https://github.com/karmaniverous/entity-manager/commit/8812313e119298f266b446b7b6b23b1eac5a58bb)
- chore: release v0.0.7 [`a260c8f`](https://github.com/karmaniverous/entity-manager/commit/a260c8f31687519b6f111612be15fe14e7be38ba)
- chore: release v0.0.6 [`4b6cec8`](https://github.com/karmaniverous/entity-manager/commit/4b6cec865c4334b499c41af1c90158061310ce1c)
- chore: release v0.0.5 [`a3c80f9`](https://github.com/karmaniverous/entity-manager/commit/a3c80f98be715ed81eb806a99e01395bad89ab45)
- chore: release v0.0.4 [`f849935`](https://github.com/karmaniverous/entity-manager/commit/f8499354723d30d617a94f16d00b7d0723955e28)
- chore: release v0.0.3 [`c9214d1`](https://github.com/karmaniverous/entity-manager/commit/c9214d14e00ed76dff88c2832104dcd596c4ed09)
- exclude tests [`ee7ce3a`](https://github.com/karmaniverous/entity-manager/commit/ee7ce3a27abd644fe810053d602dd8fccb948dd6)
- chore: release v0.0.2 [`6b656c8`](https://github.com/karmaniverous/entity-manager/commit/6b656c80ffe91eeac35618ee9a9469e482eb5826)
- chore: release v0.0.1 [`5fa932b`](https://github.com/karmaniverous/entity-manager/commit/5fa932b3e6e5414b49a1121c6a1abc97bac8961b)
- updated readme [`9327b68`](https://github.com/karmaniverous/entity-manager/commit/9327b68558ec844383f6e7456e8b4a5c89ff57eb)
- restored module & switched import to .js (!) [`69ed985`](https://github.com/karmaniverous/entity-manager/commit/69ed985d5fec3d75ccfc0a50076f4397b663f95b)
- docs [`519651a`](https://github.com/karmaniverous/entity-manager/commit/519651af2e8b9970bba7713d29126853f1e5203f)
- added testing to release script [`8e4517c`](https://github.com/karmaniverous/entity-manager/commit/8e4517c93e8880c6d8729e018ffc39fe3ba747c6)
- added version number [`b3f026a`](https://github.com/karmaniverous/entity-manager/commit/b3f026ad272e91f9f5e9f6601ede81e67f3f226a)
- disabled lint errors [`2f814f5`](https://github.com/karmaniverous/entity-manager/commit/2f814f5e3a42e36a8b8770f7ceac38f8b6b3336a)
- removed .js from import [`fb96831`](https://github.com/karmaniverous/entity-manager/commit/fb96831f094b54a47cf97c5b03d3a02b0a689337)
- ignore nyc temp dir [`dd72b06`](https://github.com/karmaniverous/entity-manager/commit/dd72b06d6174be01d995d34a74c5bbeb14bb6388)
- updated version [`e305a76`](https://github.com/karmaniverous/entity-manager/commit/e305a765317d58d60b2b01679a3a51a52f673e4b)
- added missing ignores [`42048e9`](https://github.com/karmaniverous/entity-manager/commit/42048e933ceb7ada992c813ffea9ed283c783f83)
- try eliminating module property [`67692c0`](https://github.com/karmaniverous/entity-manager/commit/67692c0d644d2edf26c0d5b61b9b1ea799b3d1b1)
- initial commit [`158622c`](https://github.com/karmaniverous/entity-manager/commit/158622c02a6b33bbb9382c91e177939d948fd9f6)

#### [v0.1.2-1](https://github.com/karmaniverous/entity-manager/compare/v0.1.2-0...v0.1.2-1)

> 24 March 2023

- Release 0.1.2-1 [`54a9bff`](https://github.com/karmaniverous/entity-manager/commit/54a9bff5d4f131cf5cfaaa4cddbb04ddfd8be4bb)
- fixed getShardKeySpace [`fbaebd6`](https://github.com/karmaniverous/entity-manager/commit/fbaebd606dc346c9cf599dd5e6500081d265393d)

#### [v0.1.2-0](https://github.com/karmaniverous/entity-manager/compare/v0.1.1...v0.1.2-0)

> 24 March 2023

- logging [`f0dd069`](https://github.com/karmaniverous/entity-manager/commit/f0dd069560e47b0ce30b7763592179b86271b895)
- Release 0.1.2-0 [`bfc84ef`](https://github.com/karmaniverous/entity-manager/commit/bfc84ef33e14d5ce1529b33e0d9c2db08bfe45c6)

#### [v0.1.1](https://github.com/karmaniverous/entity-manager/compare/v0.1.0...v0.1.1)

> 24 March 2023

- refactor shardPageKeys to pageKeys [`408bb66`](https://github.com/karmaniverous/entity-manager/commit/408bb66d8e1cbc65cd7587e84142c2dc1f633903)
- Release 0.1.1 [`f0aea12`](https://github.com/karmaniverous/entity-manager/commit/f0aea12911e4594f24dda65f741c14f5873637d0)

#### [v0.1.0](https://github.com/karmaniverous/entity-manager/compare/v0.0.12...v0.1.0)

> 23 March 2023

- added query method [`f71ad6b`](https://github.com/karmaniverous/entity-manager/commit/f71ad6b436072128d0e70b743e851730c50e568f)
- updated docs [`f0c464e`](https://github.com/karmaniverous/entity-manager/commit/f0c464e8837ab3ca8ac792cbc875f555f714850a)
- reversed keyToken & item arguments [`ec333f5`](https://github.com/karmaniverous/entity-manager/commit/ec333f555fcd035e6ddc6fdb681d313ce27c4856)
- Release 0.1.0 [`a6c327c`](https://github.com/karmaniverous/entity-manager/commit/a6c327cedbf21e680772c11f1b46dae6e32f2309)

#### [v0.0.12](https://github.com/karmaniverous/entity-manager/compare/v0.0.11...v0.0.12)

> 21 February 2023

- Release 0.0.12 [`e2490cd`](https://github.com/karmaniverous/entity-manager/commit/e2490cdde9772a1ebea4a7fb2498d189f7d7da52)
- delete nil shard keys [`28650fe`](https://github.com/karmaniverous/entity-manager/commit/28650fef1078b4fa1830f4988537f7cc54f4d8dd)

#### [v0.0.11](https://github.com/karmaniverous/entity-manager/compare/v0.0.10...v0.0.11)

> 21 February 2023

- switched sn2u to sn2n [`7c2610c`](https://github.com/karmaniverous/entity-manager/commit/7c2610cd0895f7ae1636fb9a5e1af7c6a0497c0e)
- doc update [`f6a3165`](https://github.com/karmaniverous/entity-manager/commit/f6a316534dac674febb98891121a992ce76f171c)
- Release 0.0.11 [`e2b7d80`](https://github.com/karmaniverous/entity-manager/commit/e2b7d802074b6290632f1c2ce1594f22122ae648)

#### [v0.0.10](https://github.com/karmaniverous/entity-manager/compare/v0.0.9...v0.0.10)

> 21 February 2023

- doc update [`cd5ee9c`](https://github.com/karmaniverous/entity-manager/commit/cd5ee9c90b1db7635dbcd4318fd0be89016cd035)
- Release 0.0.10 [`0143a6a`](https://github.com/karmaniverous/entity-manager/commit/0143a6a3fe3fe1aca259c72f3208abf20ffa1710)

#### [v0.0.9](https://github.com/karmaniverous/entity-manager/compare/v0.0.8...v0.0.9)

> 21 February 2023

- Release 0.0.9 [`ee3e985`](https://github.com/karmaniverous/entity-manager/commit/ee3e985967cf3861a83a7e2dab9461953bc445e3)
- updated test config obj [`5b654ce`](https://github.com/karmaniverous/entity-manager/commit/5b654ce3bd7bde3c7f34bd0ce6f66612371c10ce)
- docs update [`2ad2ad6`](https://github.com/karmaniverous/entity-manager/commit/2ad2ad64668387e972bbba6fce030af56fb1ea91)

#### [v0.0.8](https://github.com/karmaniverous/entity-manager/compare/v0.0.7...v0.0.8)

> 20 February 2023

- org change [`e2d582f`](https://github.com/karmaniverous/entity-manager/commit/e2d582ff1bf00135d56c914d3154f8c3ab10eec0)
- doc update [`38b11dc`](https://github.com/karmaniverous/entity-manager/commit/38b11dc2ebde62addf1ee85e8db3ada18e4fd40d)
- Release 0.0.8 [`bd88dda`](https://github.com/karmaniverous/entity-manager/commit/bd88dda2436c257f2cc8d77014660bcd892d29cb)
- removed bin entry point [`e5fff10`](https://github.com/karmaniverous/entity-manager/commit/e5fff10be1290290afaf482ca96a7cb5c25176d6)

#### [v0.0.7](https://github.com/karmaniverous/entity-manager/compare/v0.0.6...v0.0.7)

> 20 February 2023

- Eliminated prod dependency [`1a77c45`](https://github.com/karmaniverous/entity-manager/commit/1a77c459e948182fb428f4c4242bb6108d0b0673)
- Release 0.0.7 [`6932a79`](https://github.com/karmaniverous/entity-manager/commit/6932a79d0ebee6d34b7044e73df0c0c745b7beae)

#### [v0.0.6](https://github.com/karmaniverous/entity-manager/compare/v0.0.5...v0.0.6)

> 20 February 2023

- readability [`1ebed3d`](https://github.com/karmaniverous/entity-manager/commit/1ebed3de130d85b7dc7dbf5d5af1966eea281d1e)
- doc update [`b1737a2`](https://github.com/karmaniverous/entity-manager/commit/b1737a2005a85ab1d627243f631c7715716ea829)
- Release 0.0.6 [`0d1b776`](https://github.com/karmaniverous/entity-manager/commit/0d1b776b3dd110b58d1ff46699041a8b91d76db7)
- doc update [`653beb9`](https://github.com/karmaniverous/entity-manager/commit/653beb92905d08e0ebbcb018302a897ea3b6accb)
- doc update [`335adb1`](https://github.com/karmaniverous/entity-manager/commit/335adb118b7e6a6adcc98d10f573b59239952007)

#### [v0.0.5](https://github.com/karmaniverous/entity-manager/compare/v0.0.4...v0.0.5)

> 19 February 2023

- switched to faster hash algo [`369d6bc`](https://github.com/karmaniverous/entity-manager/commit/369d6bc22512cf58916551569cd2c8312077a038)
- Release 0.0.5 [`2584f3c`](https://github.com/karmaniverous/entity-manager/commit/2584f3c33f16f21aa44dc83d23614c0100164aec)
- updated docs [`e7dbe40`](https://github.com/karmaniverous/entity-manager/commit/e7dbe40076a8aa7a34b89f8f164c899ade625889)

#### [v0.0.4](https://github.com/karmaniverous/entity-manager/compare/v0.0.3...v0.0.4)

> 19 February 2023

- Release 0.0.4 [`89eebda`](https://github.com/karmaniverous/entity-manager/commit/89eebda8cf37cec2741b01d57ca7ba0b55e6104b)

#### [v0.0.3](https://github.com/karmaniverous/entity-manager/compare/v0.0.2...v0.0.3)

> 19 February 2023

- refactored to EntityManager with private class [`e4cadc9`](https://github.com/karmaniverous/entity-manager/commit/e4cadc9237c1550708d56565ffbbf53a259a74e1)
- added EntityManager methods [`d9aefbf`](https://github.com/karmaniverous/entity-manager/commit/d9aefbf358ea5d2d90ecb4ddc9f769e68c9beb94)
- updated npmenclature [`f5563fb`](https://github.com/karmaniverous/entity-manager/commit/f5563fb1d3ca1db715533f61c2c44281e59d7340)
- tested bumped keyspaces [`23172fb`](https://github.com/karmaniverous/entity-manager/commit/23172fb5c41b665ecfd1d05092ad32e5909aed5e)
- improved logging [`128aae9`](https://github.com/karmaniverous/entity-manager/commit/128aae96b3f62bdc196065b69c0a37b1c91dd84a)
- updated docs [`860d62b`](https://github.com/karmaniverous/entity-manager/commit/860d62b369157bbc207abdc7cd41dde389b03bc8)
- Release 0.0.3 [`78b8a8d`](https://github.com/karmaniverous/entity-manager/commit/78b8a8d8d50e68dbc828199c3fb96502bfbae7b0)
- doc update [`3c654ce`](https://github.com/karmaniverous/entity-manager/commit/3c654ce62a0d7adf4850e0b84d77f57df3a2fcbf)
- doc update [`80afcac`](https://github.com/karmaniverous/entity-manager/commit/80afcaca0284155f062cf4d657ae254134794e06)
- fixed test error [`ec5c5d2`](https://github.com/karmaniverous/entity-manager/commit/ec5c5d225b05ec9315e8969db26c8cc43e533d81)

#### [v0.0.2](https://github.com/karmaniverous/entity-manager/compare/v0.0.1...v0.0.2)

> 15 February 2023

- update docs [`872e5c6`](https://github.com/karmaniverous/entity-manager/commit/872e5c65bf7bb4038d91961c1aaf15debb8c15e9)
- Release 0.0.2 [`978d64e`](https://github.com/karmaniverous/entity-manager/commit/978d64e855bf4441e88a8eacab659af6b914cdda)

#### [v0.0.1](https://github.com/karmaniverous/entity-manager/compare/v0.0.0...v0.0.1)

> 15 February 2023

- refactored to shard-key-manager [`89ae74b`](https://github.com/karmaniverous/entity-manager/commit/89ae74b0955db6731576faf22ecb0e1f6ed46559)
- basic config [`4244f4b`](https://github.com/karmaniverous/entity-manager/commit/4244f4b7f0baf12fb7e39f00103549899ed9e775)
- updated docs [`a919b4c`](https://github.com/karmaniverous/entity-manager/commit/a919b4c12c515f8d49ddaba6b012df9b80e84214)
- added jsonschema tests [`94f9c11`](https://github.com/karmaniverous/entity-manager/commit/94f9c11ca8b22439f80fc6ee0c3c7e1b020b5478)
- eliminated lodash chaining [`4c53e5d`](https://github.com/karmaniverous/entity-manager/commit/4c53e5dbcf1f5fb5b4cd08cc70fa7f386a168f7c)
- renamed to shard-manager [`977e461`](https://github.com/karmaniverous/entity-manager/commit/977e4619862d006743de836e2bb65541530a755d)
- Release 0.0.1 [`8d4fdbd`](https://github.com/karmaniverous/entity-manager/commit/8d4fdbd5cf046123f3c49772b49c94cd260d6a68)

#### v0.0.0

> 14 February 2023

- Initial commit [`ab7a546`](https://github.com/karmaniverous/entity-manager/commit/ab7a546c405e44552f4ee9b0e348cc8684b6ce7c)
