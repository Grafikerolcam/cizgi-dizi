import React from "react";
import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { Bolum, SON_KART } from "./Bolum";
import { KarakterVitrini } from "./Vitrin";
import { BolumData, BolumProps } from "./types";

const FPS = 30;

const meta: CalculateMetadataFunction<BolumProps> = async ({ props }) => {
  const r = await fetch(staticFile(`diziler/${props.dizi}/${props.bolum}/data.json`));
  if (!r.ok) throw new Error(`data.json yok: önce  npm run seslendir -- ${props.dizi} ${props.bolum}`);
  const data = (await r.json()) as BolumData;
  return { durationInFrames: Math.ceil((data.sure + SON_KART) * FPS), props: { ...props, data } };
};

export const Kok: React.FC = () => (
  <>
    <Composition
      id="Bolum"
      component={Bolum}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={300}
      defaultProps={{ dizi: "ornek-konak", bolum: "bolum-01" } as BolumProps}
      calculateMetadata={meta}
    />
    <Composition id="Vitrin" component={KarakterVitrini} width={1080} height={1920} fps={FPS} durationInFrames={150} defaultProps={{ dizi: "ornek-konak" }} />
  </>
);

