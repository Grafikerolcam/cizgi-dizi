import React from "react";
import { CalculateMetadataFunction, Composition, Still, staticFile } from "remotion";
import { Kapak, KapakProps } from "./Kapak";
import { Bolum, SON_KART } from "./Bolum";
import { KarakterVitrini } from "./Vitrin";
import { BolumData, BolumProps } from "./types";

const FPS = 30;

const veri = async (props: BolumProps) => {
  const r = await fetch(staticFile(`diziler/${props.dizi}/${props.bolum}/data.json`));
  if (!r.ok) throw new Error(`data.json yok: önce  npm run seslendir -- ${props.dizi} ${props.bolum}`);
  return (await r.json()) as BolumData;
};

const meta: CalculateMetadataFunction<BolumProps> = async ({ props }) => {
  const data = await veri(props);
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
    <Still id="Kapak" component={Kapak} width={1080} height={1920} defaultProps={{ dizi: "ornek-konak", bolum: "bolum-01" } as KapakProps} calculateMetadata={async ({ props }) => ({ props: { ...props, data: await veri(props) } })} />
    <Composition id="Vitrin" component={KarakterVitrini} width={1080} height={1920} fps={FPS} durationInFrames={150} defaultProps={{ dizi: "ornek-konak" }} />
  </>
);

