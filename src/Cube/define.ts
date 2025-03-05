class CubeDefine {
    // 8 BLOCKS OF CUBE Vec3
    static BLOCKS: number[][] = [[-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, -1], [1, -1, 1], [1, 1, -1], [1, 1, 1]]

    // 6 FACES OF CUBE Vec3
    static FACES: number[][] = [[-1, 0, 0], [0, -1, 0], [0, 0, -1], [1, 0, 0], [0, 1, 0], [0, 0, 1]]

    // 4 INDEX OF EACH FACE index
    static FACES_BLOCKS: number[][] = [[0, 1, 2, 3], [0, 1, 4, 5], [0, 2, 4, 6], [4, 5, 6, 7], [2, 3, 6, 7], [1, 3, 5, 7]]

    // 3 FACE OF EACH BLOCK index
    static BLOCKS_FACES: number[][] = [[0, 1, 2], [5, 1, 0], [0, 2, 4], [0, 4, 5], [3, 2, 1], [5, 3, 1], [2, 3, 4], [5, 4, 3]]


    // mapping details with above defines
    static MAPPING: number[][][] =
        [
            [[0, 2, 0], [1, 0, 1], [2, 3, 0], [3, 1, 2]],
            [[0, 1, 0], [1, 5, 1], [4, 0, 2], [5, 4, 0]],
            [[0, 4, 2], [2, 0, 1], [4, 6, 2], [6, 2, 1]],
            [[4, 5, 1], [5, 7, 1], [6, 4, 2], [7, 6, 2]],
            [[2, 6, 0], [3, 2, 1], [6, 7, 2], [7, 3, 0]],
            [[1, 3, 2], [3, 7, 1], [5, 1, 0], [7, 5, 0]],
        ]


            
    // 6 FACECLOR OF CUBE Vec3
    static FACES_COLORS: number[][] = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 1, 1], [1, 0, 1], [1, 1, 0]]


    // MESH HELP INDEXS RECTANGLE TO TWO TRIANGLES
    static QUAD_INDICES: number[] = [0, 1, 2, 0, 2, 3]

    // MESH HELP INDEXS THREE INNER FACE TO SIX TRIANGLES
    static CONNER_INDICES: number[] = [
        0, 1, 2, 0, 2, 3,
        0, 3, 4, 0, 4, 5,
        0, 5, 6, 0, 6, 1,]
}




export default CubeDefine