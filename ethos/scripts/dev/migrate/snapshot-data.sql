-- address/username --> profileId
-- identifier-to-profile-id.jsonl
SELECT "address" AS identifier, "profileId" FROM "profile_addresses"
UNION
SELECT "username" AS identifier, "profileId" FROM "attestations" a
LEFT JOIN "twitter_profiles_cache" tpc ON a.account = tpc.id
WHERE "archived" = FALSE;

-- profileId --> address/attestation userkey
-- userkey-by-profile-id.jsonl
WITH result AS (
	SELECT "profileId", 'address:' || address AS userkey, NULL AS "updatedAt"
	FROM "profile_addresses"
	UNION
	SELECT "profileId", 'service:' || service || ':' || account AS userkey, "updatedAt"
	FROM "attestations"
	WHERE archived = FALSE
	ORDER BY "updatedAt" DESC
)
SELECT "profileId", userkey FROM result;

-- reviews
-- reviews.jsonl
SELECT
  id,
  "authorProfileId",
  CASE
    WHEN service != '' THEN 'service:x.com:' || account
    ELSE 'address:' || subject
  END "subjectUserkey",
  score,
  comment,
  metadata,
  "createdAt"
FROM reviews
WHERE archived = FALSE;

-- vouches
-- vouches.jsonl
SELECT
  id,
  "authorProfileId",
  "subjectProfileId",
  deposited,
  comment,
  metadata,
  "vouchedAt"
FROM vouches
WHERE archived = FALSE;
