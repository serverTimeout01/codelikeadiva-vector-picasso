import p5 from 'p5';
import 'p5/lib/addons/p5.dom';
import 'p5.js-svg';
//import 'p5/lib/addons/p5.speech';
import Color from 'color';

class Artwork {

	//################################################################################

	constructor() {}

	//################################################################################

	init() {
		const ARTWORK_WRAPPER_ID = 'artwork-wrapper';
		this.artworkWrapper = document.getElementById(ARTWORK_WRAPPER_ID);
		var myp5 = new p5(this.createTemplate(), this.artworkWrapper);
	}

	//################################################################################

	createTemplate() {

		let sw = this.artworkWrapper.clientWidth;
		let sh = this.artworkWrapper.clientHeight;
		let swHalf = Math.floor(sw / 2);
		let shHalf = Math.floor(sh / 2);

		return (p) => {
			
			var capture;
			var snapshot;
			var vScale = 12;
			var vSyncscale = 4;
			var listen = false;

			var minR = 30;
			var maxR = 60;
			var font;
			var demoMode = false;
			var scaledWidth = Math.floor(sw / vScale);
			var scaledHeight = Math.floor(sh / vScale);
			var scaledRMax = Math.floor(maxR / vScale);
			var yOffset;
			var xOffset;

			var speechbobbleCache = [];
			var speechbobbleCacheSize = 3;
			var lastPushedIndex = -1;

			var speechRec;
			var DE = 'de-DE';
			var EN = 'en-US';

			p.preload = () => {
				demoMode = p.getParam('demo') == 'true';
				font = p.loadFont('http://ff.cdn.1001fonts.net/b/a/bangers.regular.ttf');
				if (demoMode) {
					snapshot = p.loadImage('https://www.mediaite.com/wp-content/uploads/2016/03/Screen-Shot-2016-03-21-at-12.29.01-PM.jpg');
					//snapshot = p.loadImage("https://media1.s-nbcnews.com/j/newscms/2017_10/1926261/china_trump_trademarks_70301-jpg-f8dba_550679227a1881ca317cb1375afd41ef.nbcnews-ux-2880-1000.jpg");
				}
			};

		    //+++++++++++++++++++++++++++++++++++++++++++++++

			p.setup = () => {
				p.createCanvas(sw, sh, p.SVG);
				if (!demoMode) {
					capture = p.createCapture(p.VIDEO);
					capture.size(sw, sh);
					capture.hide();					
					
					listen = document.getElementById('enableSpeechReg').checked;

					if (!demoMode && listen) {
						speechRec = new p5.SpeechRec(EN, p.parseInput);
						speechRec.start(true, false);	
					}
				}			

				yOffset = Math.floor((sh % vScale) / 2 + (vScale / 2));
				xOffset = Math.floor((sw % vScale) / 2 + (vScale / 2));
				p.frameRate(1);
				p.background(0);
				p.fill(0);

			};

			//+++++++++++++++++++++++++++++++++++++++++++++++

			p.draw = () => {

				if (demoMode) {
					p.pixelDensity(1);
				}  else {
					snapshot = capture.get();
				}
				snapshot.loadPixels();

				// reset

				p.fill(0);
				p.noStroke();
				p.background(0);

				for (var y = 0; y <scaledHeight; y++) {
					for (var x =0; x < scaledWidth; x++) {
						var index = ((x*vScale)+(y*vScale*sw)) * vSyncscale;
						var r = snapshot.pixels[index+0];
						var g = snapshot.pixels[index+1];
						var b = snapshot.pixels[index+2];
						var bright = (r+g+b) / 3;
						p.drawDot(x*vScale+xOffset, y*vScale+yOffset, g, r, b, p.map(bright, 0, 255, 0, vScale));
					}
				}

				if (demoMode) {
			    	p.drawSpeech('I screwed up bigly.', 50, 450);
			    	p.drawSpeech('China', 500, 110);
			    	p.drawSpeech('YUGE', 600, 500);
			    	p.noLoop();
				} else {
					if (!listen) {
						p.pushToSpeechbobbleCache(document.getElementById('sph').value);
						p.pushToSpeechbobbleCache(document.getElementById('sph2').value);
						p.pushToSpeechbobbleCache(document.getElementById('sph3').value);
					}
			    	p.drawSpeech(speechbobbleCache[0]);
			    	p.drawSpeech(speechbobbleCache[1]);
			    	p.drawSpeech(speechbobbleCache[2]);
				}

	 	    };
	 
	 		//+++++++++++++++++++++++++++++++++++++++++++++++

	 		p.drawDot = (sx, sy, r, g, b, size) => {

				if (!r) {
					r = 0;
					g = 0;
					b = 0;
				}

				var rgb = Color(`rgb(${r}, ${g}, ${b})`);
				var hsl = rgb.hsl();

				hsl = hsl.saturationl(document.getElementById('sat').value);

				p.fill(p.color(hsl.red(), hsl.green(), hsl.blue()));
				p.ellipse(sx, sy, size);	

			};
	 
	 		//+++++++++++++++++++++++++++++++++++++++++++++++

			p.determineQuatrant = (x, y) => {
				if (x > swHalf) {
					if (y > shHalf) {
						return 4;
					} else {
						return 2;
					}
				} else {
					if (y > shHalf) {
						return 3;
					} else {
						return 1;
					}
				}
			}
	 
	 		//+++++++++++++++++++++++++++++++++++++++++++++++

	 		p.drawSpeech = (speechText, fixedTX, fixedTY) => {
	 		  if (speechText === '') return;
			  	var ts = parseInt(document.getElementById('sbf').value, 10);
				if (ts > 0) {
					  p.textFont(font);
					  p.textSize(ts);
					  var extraEllipsePadding  = 30;
					  var predictedTextWidth = p.textWidth(speechText);
					  if (fixedTX >= 0 && fixedTY >= 0) {
					  	var tx = fixedTX;
					  	var ty = fixedTY;	
					  } else {
					  	var tx = p.random(extraEllipsePadding + ts, sw-(predictedTextWidth+ts));
					  	var ty = p.random(extraEllipsePadding + ts, sh-(ts+ts));					  	
					  }

					  var bbox = font.textBounds(speechText, tx, ty, ts);
					  var quadrant = p.determineQuatrant(tx, ty);
					  var strkW = 2;

					  // Speechbubble

					  var spikeOffsetY = (strkW * 2) + 3;
					  var spikeSpan = bbox.w / 3;

					  var spikeStartX = bbox.x + (bbox.w / 3);
					  var spikeStartY;

					  var spikePeakX;
					  var spikePeakY;

					  // determine spike orientation 

					  if (quadrant == 1 || quadrant == 3) {
					  	spikePeakX = spikeStartX + (spikeSpan * 2);
					  }

					  if (quadrant == 2 || quadrant == 4) {
					  	spikePeakX = spikeStartX - spikeSpan;
					  }

					  if (quadrant == 1 || quadrant == 2) {
					  	spikeStartY = bbox.y + (bbox.h * 2) - spikeOffsetY;
					  	spikePeakY = spikeStartY + bbox.h;
					  }

					  if (quadrant == 3 || quadrant == 4) {
					  	spikeStartY = bbox.y - bbox.h + spikeOffsetY;
					  	spikePeakY = spikeStartY - bbox.h;
					  }

					  // Spike Outline
					  p.strokeWeight(strkW*2);
					  p.stroke(255,0, 0);
					  p.line(spikeStartX, spikeStartY, spikePeakX, spikePeakY);
					  p.line(spikePeakX, spikePeakY, spikeStartX + spikeSpan, spikeStartY);

					  // Speechbobble Body and Outline
					  p.strokeWeight(strkW);
					  p.stroke(255,0, 0);
					  p.fill(255,255,255);  
					  
					  p.ellipse((bbox.w/2) + bbox.x, (bbox.h/2)+bbox.y, bbox.w + bbox.h + extraEllipsePadding, bbox.h*3);

					  // Spike Body
					  p.noStroke();
					  p.triangle(spikeStartX, spikeStartY, spikeStartX + spikeSpan, spikeStartY, spikePeakX, spikePeakY);
					  
					  // Speechbobble Text
					  p.strokeWeight(strkW*2);
					  p.stroke(255,88, 0);
					  p.fill(255,255,0);  
					  p.text(speechText, tx, ty);

				}
			}

			//+++++++++++++++++++++++++++++++++++++++++++++++

			p.pushToSpeechbobbleCache = (words) => {
				lastPushedIndex++;
				if (lastPushedIndex >= speechbobbleCacheSize)  {
					lastPushedIndex = 0;
				}
				speechbobbleCache[lastPushedIndex] = words;
			}

			//+++++++++++++++++++++++++++++++++++++++++++++++

			p.parseInput = () => {
			  if (this.resultValue) {   
			    var words = this.resultString;
			    console.log(words);
			    console.log(parseInt(this.resultConfidence * 100, 10));
			    p.pushToSpeechbobbleCache(words);
			  }
			}

			//+++++++++++++++++++++++++++++++++++++++++++++++

			p.getParam = (e) => {var t=e.replace(/[[]/,"\\[").replace(/[\]]/,"\\]"),n="[\\?&]"+t+"=([^&#]*)",i=new RegExp(n),a=i.exec(window.location.href);return null===a?"":a[1]}

		}
	}

	//################################################################################

}

export default Artwork;