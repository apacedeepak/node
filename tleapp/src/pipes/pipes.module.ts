import { NgModule } from '@angular/core';
import { SeparatorPipe } from './separator/separator';
import { PipesRemovehtmltagsPipe } from './pipes-removehtmltags/pipes-removehtmltags';
import { PipesArraytostringPipe } from './pipes-arraytostring/pipes-arraytostring';
import { PipesSplitPipe } from './pipes-split/pipes-split';

@NgModule({
	declarations: [SeparatorPipe,
	PipesRemovehtmltagsPipe,
	PipesArraytostringPipe,
    PipesSplitPipe],
	imports: [],
	exports: [SeparatorPipe,
	PipesRemovehtmltagsPipe,
	PipesArraytostringPipe,
    PipesSplitPipe]
})
export class PipesModule {}
