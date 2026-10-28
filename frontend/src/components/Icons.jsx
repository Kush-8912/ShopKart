// Small outline icons (24×24 grid), coloured with currentColor
function Icon({ className = 'w-5 h-5', children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const CartIcon = (props) => (
  <Icon {...props}>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
    <path d="M2.5 3h2.6l2.3 11.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.1L21 7H5.9" />
  </Icon>
)

export const HeartIcon = (props) => (
  <Icon {...props}>
    <path d="M12 20s-7.5-4.6-9.2-9.4C1.6 7.1 3.9 4 7.4 4c2 0 3.5 1.1 4.6 2.7C13.1 5.1 14.6 4 16.6 4c3.5 0 5.8 3.1 4.6 6.6C19.5 15.4 12 20 12 20z" />
  </Icon>
)

export const PackageIcon = (props) => (
  <Icon {...props}>
    <path d="M21 7.5l-9-4.5-9 4.5 9 4.5 9-4.5z" />
    <path d="M3 7.5v9l9 4.5 9-4.5v-9" />
    <path d="M12 12v9" />
  </Icon>
)

export const GridIcon = (props) => (
  <Icon {...props}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </Icon>
)

export const HomeIcon = (props) => (
  <Icon {...props}>
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5.5 9v11h13V9" />
  </Icon>
)

export const ShieldIcon = (props) => (
  <Icon {...props}>
    <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z" />
    <path d="M9 12l2 2 4-4" />
  </Icon>
)

export const TruckIcon = (props) => (
  <Icon {...props}>
    <path d="M2.5 6h11v10h-11z" />
    <path d="M13.5 9.5h4l3 3.5v3h-7" />
    <circle cx="6.5" cy="18" r="1.8" />
    <circle cx="17" cy="18" r="1.8" />
  </Icon>
)

export const CardIcon = (props) => (
  <Icon {...props}>
    <rect x="2.5" y="5" width="19" height="14" rx="2" />
    <path d="M2.5 10h19" />
    <path d="M6.5 15h4" />
  </Icon>
)

export const UserIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </Icon>
)

export const CheckIcon = (props) => (
  <Icon {...props}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
)

export const ArrowRightIcon = (props) => (
  <Icon {...props}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </Icon>
)

export const LogoutIcon = (props) => (
  <Icon {...props}>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    <path d="M9 16l-4-4 4-4" />
    <path d="M5 12h10" />
  </Icon>
)

export const EyeIcon = (props) => (
  <Icon {...props}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)

export const EyeOffIcon = (props) => (
  <Icon {...props}>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1" />
    <path d="M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7c1.7 0 3.2-.5 4.5-1.2" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </Icon>
)

export const PlusIcon = (props) => (
  <Icon {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icon>
)

export const MinusIcon = (props) => (
  <Icon {...props}>
    <path d="M5 12h14" />
  </Icon>
)

export const TrashIcon = (props) => (
  <Icon {...props}>
    <path d="M4 7h16" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    <path d="M9 7V4h6v3" />
  </Icon>
)
