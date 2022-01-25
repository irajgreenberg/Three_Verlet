	varying vec2 vUv;
	#ifdef USE_SKINNING
			uniform mat4 bindMatrix;
			uniform mat4 bindMatrixInverse;
			#ifdef BONE_TEXTURE
					uniform sampler2D boneTexture;
					uniform int boneTextureSize;
					mat4 getBoneMatrix( const in float i ) {
							float j = i * 4.0;
							float x = mod( j, float( boneTextureSize ) );
							float y = floor( j / float( boneTextureSize ) );
							float dx = 1.0 / float( boneTextureSize );
							float dy = 1.0 / float( boneTextureSize );
							y = dy * ( y + 0.5 );
							vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
							vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
							vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
							vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );
							mat4 bone = mat4( v1, v2, v3, v4 );
							return bone;
					}
			#else
					uniform mat4 boneMatrices[ MAX_BONES ];
					mat4 getBoneMatrix( const in float i ) {
							mat4 bone = boneMatrices[ int(i) ];
							return bone;
					}
			#endif
	#endif
	void main() {
			vUv = uv;
			#ifdef USE_SKINNING
					mat4 boneMatX = getBoneMatrix( skinIndex.x );
					mat4 boneMatY = getBoneMatrix( skinIndex.y );
					mat4 boneMatZ = getBoneMatrix( skinIndex.z );
					mat4 boneMatW = getBoneMatrix( skinIndex.w );
					mat4 skinMatrix = mat4( 0.0 );
					skinMatrix += skinWeight.x * boneMatX;
					skinMatrix += skinWeight.y * boneMatY;
					skinMatrix += skinWeight.z * boneMatZ;
					skinMatrix += skinWeight.w * boneMatW;
					skinMatrix  = bindMatrixInverse * skinMatrix * bindMatrix;
					vec4 skinVertex = bindMatrix * vec4( position, 1.0 );
					vec4 skinned = vec4( 0.0 );
					skinned += boneMatX * skinVertex * skinWeight.x;
					skinned += boneMatY * skinVertex * skinWeight.y;
					skinned += boneMatZ * skinVertex * skinWeight.z;
					skinned += boneMatW * skinVertex * skinWeight.w;
					skinned  = bindMatrixInverse * skinned;
					vec4 mvPosition = modelViewMatrix * skinned;
			#else
					vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
			#endif
			gl_Position = projectionMatrix * mvPosition;
	}
	