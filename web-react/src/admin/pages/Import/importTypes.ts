import { getAdminOrgTeamsRoute } from 'router/routes'

type TImport = {
  [key: string]: {
    columns: string[]
    explanation: TImportExplanation
  }
}
export type TImportExplanation = {
  description: string
  explanations: TImportCard[]
}
type TImportCard = {
  title: string
  description: string
  link?: string
}

export const getImportTypes = ({
  organizationSlug,
}: {
  organizationSlug: string
}): TImport => {
  return {
    player: {
      columns: [
        'firstName',
        'lastName',
        'externalId',
        'teamName',
        'teamId',
        'avatar',
        'activityStatus',
        'email',
        'phone',
        'gender',
        'levelCode',
        'birthday',
        'countryBirth',
        'cityBirth',
        'country',
        'city',
        'publicProfileUrl',
        'positionName',
        'positionId',
        'stick',
        'height',
        'weight',
        'jerseyNumber',
      ],
      explanation: {
        description:
          'Most of the fields are self-explanatory and use string type of input. The only fields that require some explanation are:',
        explanations: [
          {
            title: 'teamId',
            description:
              'The teamId is the unique identifier of the team. You can find it in the URL of the team page.',
            link: getAdminOrgTeamsRoute(organizationSlug),
          },
          {
            title: 'activityStatus',
            description:
              'Activity status is a string that can be one of the following: ACTIVE, INACTIVE, RETIRED, UNKNOWN.',
          },
          {
            title: 'levelCode',
            description:
              'Level code is a string that can be one of the defined levels in the organization. Default: amateur, hockey-player, power-player. You can find the list of levels in the organization settings.',
            link: '/admin/rulePack/phm/e1081e2b-ca6e-4fdc-bf0e-ebc47fbcb183',
          },
          {
            title: 'birthday',
            description:
              'Birthday is a string that should be in the format of YYYY-MM-DD.',
          },
          {
            title: 'positionId',
            description:
              'PositionId is the unique identifier of the position. You can find it in the list of position of the particular team.',
            link: getAdminOrgTeamsRoute(organizationSlug),
          },
          {
            title: 'jerseyNumber',
            description:
              'Jersey number is a string that can be any number from 1 to 99. It will automatically mapped to the team jersey number.',
          },
        ],
      },
    },
  }
}
