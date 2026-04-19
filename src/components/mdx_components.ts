import Animator from "./Animator.astro";
import CollectionLink from "./CollectionLink.astro";

import Faint from "./markup/Faint.astro";
import Red from "./markup/Red.astro";
import Color from "./markup/Color.astro";
import Size from "./markup/Size.astro";
import Mark from "./markup/Mark.astro";
import Block from "./markup/Block.astro";
import Border from "./markup/Border.astro";
import Arrow from "./svg/Arrow.astro";

import { CldImage } from 'astro-cloudinary';

export const components = {
  Animator,
  CollectionLink,
  Faint,
  Red,
  Color,
  Size,
  Mark,
  Block,
  Border,
  CldImage,
  Arrow,
};