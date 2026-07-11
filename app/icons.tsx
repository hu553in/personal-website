import {
  FaEnvelope,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaMoon,
  FaSun,
  FaTelegram,
} from "react-icons/fa6";

const iconClassName = "size-4 shrink-0";

const GitHubIcon = () => (
  <FaGithub aria-hidden="true" className={iconClassName} />
);

const LinkedInIcon = () => (
  <FaLinkedin aria-hidden="true" className={iconClassName} />
);

const TelegramIcon = () => (
  <FaTelegram aria-hidden="true" className={iconClassName} />
);

const InstagramIcon = () => (
  <FaInstagram aria-hidden="true" className={iconClassName} />
);

const EmailIcon = () => (
  <FaEnvelope aria-hidden="true" className={iconClassName} />
);

const MoonIcon = () => (
  <FaMoon aria-hidden="true" className={`${iconClassName} dark:hidden`} />
);

const SunIcon = () => (
  <FaSun aria-hidden="true" className={`hidden ${iconClassName} dark:block`} />
);

export {
  EmailIcon,
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  MoonIcon,
  SunIcon,
  TelegramIcon,
};
